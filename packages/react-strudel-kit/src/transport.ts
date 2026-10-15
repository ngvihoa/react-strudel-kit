import type { Engine } from './engine'
import type { StrudelError, StrudelErrorCode, StrudelInput, UseStrudelResult } from './types'

type Snapshot = Pick<UseStrudelResult, 'status' | 'error'>
type Dependencies = {
    createEngine: () => Promise<Engine>
    unlockAudio: () => Promise<void>
}

const idle: Snapshot = { status: 'idle', error: null }
const toError = (code: StrudelErrorCode, cause: unknown): StrudelError => ({
    code,
    message: cause instanceof Error ? cause.message : 'Không thể chạy pattern.',
    cause,
})

/** One transport per browser app; all consumers observe the same playback. */
export const createTransport = (dependencies: Dependencies) => {
    let snapshot = idle
    let engine: Engine | undefined
    let initializing: Promise<Engine> | undefined
    let revision = 0
    let queue = Promise.resolve()
    let cancelReadiness = () => {}
    const listeners = new Set<() => void>()

    const publish = (next: Snapshot) => {
        snapshot = next
        listeners.forEach((listener) => listener())
    }

    const ensureEngine = () => {
        if (engine) return Promise.resolve(engine)
        if (!initializing) {
            initializing = Promise.resolve().then(dependencies.createEngine).then(
                (value) => { engine = value; return value },
                (cause) => { initializing = undefined; throw cause },
            )
        }
        return initializing
    }

    const stopEngine = (): StrudelError | null => {
        try {
            engine?.stop()
            return null
        } catch (cause) {
            return toError('transport', cause)
        }
    }

    const stop = () => {
        revision++
        cancelReadiness()
        const error = stopEngine()
        publish(error ? { status: 'error', error } : idle)
    }

    const play = async (input: StrudelInput) => {
        if (!listeners.size) return
        const request = ++revision
        cancelReadiness()
        const current = () => revision === request && listeners.size > 0
        const stopError = stopEngine()
        if (stopError) {
            publish({ status: 'error', error: stopError })
            return
        }
        publish(idle)
        const cancelled = new Promise<undefined>((resolve) => {
            cancelReadiness = () => resolve(undefined)
        })

        // Both operations start now, including resume() in the click handler.
        // Settle errors immediately, even while a previous request is draining.
        const ready = Promise.all([
            ensureEngine().catch((cause) => { throw toError('initialization', cause) }),
            (async () => dependencies.unlockAudio())()
                .catch((cause) => { throw toError('transport', cause) }),
        ]).then(
            ([value]) => ({ engine: value, error: null }),
            (error: StrudelError) => ({ engine: undefined, error }),
        )

        const operation = queue.then(async () => {
            const prepared = await Promise.race([ready, cancelled])
            if (!prepared || !current()) return
            if (prepared.error) {
                publish({ status: 'error', error: prepared.error })
                return
            }
            const activeEngine = prepared.engine!
            let stage: StrudelErrorCode = input !== null && typeof input === 'object' && 'play' in input
                ? 'transport' : 'evaluation'
            try {
                await activeEngine.prepare(input)
                if (!current()) return
                stage = 'transport'
                await activeEngine.start()
                if (!current()) {
                    // A scheduler start may finish after Stop or unmount.
                    stopEngine()
                    return
                }
                publish({ status: 'playing', error: null })
            } catch (cause) {
                const cleanupError = stopEngine()
                if (current()) {
                    publish({ status: 'error', error: cleanupError ?? toError(stage, cause) })
                }
            }
        })
        queue = operation
        await operation
    }

    const subscribe = (listener: () => void) => {
        listeners.add(listener)
        const request = revision
        void ensureEngine().catch((cause) => {
            if (listeners.size && revision === request) {
                publish({ status: 'error', error: toError('initialization', cause) })
            }
        })
        return () => {
            listeners.delete(listener)
            // Strict Mode can unsubscribe/re-subscribe; initialization is retained.
            if (!listeners.size) stop()
        }
    }

    return {
        subscribe,
        getSnapshot: () => snapshot,
        getServerSnapshot: () => idle,
        play,
        stop,
    }
}
