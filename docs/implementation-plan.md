# Implementation Plan

> **Kế hoạch tiếp theo được ghi ở phần cập nhật bên dưới.** Các mục từ “Tên tạm” trở đi là tài liệu thiết kế ban đầu, giữ để tham khảo và không phản ánh đầy đủ trạng thái triển khai hiện tại. Xem [usage guide](usage.md) và [README](../README.md) để dùng API đang được hỗ trợ.

## Cập nhật 2026-10-20: Trang hướng dẫn, examples và Sound Cookbook

### Mục tiêu và phạm vi

Phát triển reference app thành nơi học cách sử dụng **react-strudel-kit**:
đọc giải thích, nghe kết quả, thay đổi thông số và hiểu cách tự xây dựng bản nhạc.
Giữ lại mixer và code editor hiện tại. Tận dụng Vite app đang có trước khi
cân nhắc framework tài liệu hoặc tách app riêng.

Đây là kế hoạch chưa triển khai. Chưa có template UI hoàn chỉnh; cần thiết kế
template và thực hiện một bài mẫu trước khi mở rộng nội dung.

### Cấu trúc điều hướng

| Phần | Nội dung và vai trò |
| --- | --- |
| Hướng dẫn | Bài học theo trình tự: phát âm thanh, tạo nhịp, thêm bass, ghép các phần và điều khiển bằng React |
| Sound Cookbook | Phân loại âm thanh, giải thích cách tạo và các cách triển khai bằng kit |
| Examples | Mỗi ví dụ có trang riêng, mục tiêu học, code, giải thích và player tương tác |
| Playground | Giữ mixer và editor để thử nghiệm tự do |
| API Reference | Tra cứu helper, tham số, kiểu dữ liệu, hành vi và giới hạn được hỗ trợ |

### Hướng template UI

- Sidebar trái cho điều hướng bài học và nhóm âm thanh.
- Nội dung giữa cho giải thích, code và các bước thực hành.
- Player cạnh nội dung trên desktop; đặt trong luồng bài học trên mobile.
- Trang hướng dẫn ưu tiên cách đọc và làm theo; trang example ưu tiên player,
  mixer và code. Dùng chung màu sắc, typography và component.
- Player có Play/Stop, trạng thái phát, lỗi và các thông số phù hợp với bài học.
- Giữ nguyên nguyên tắc audio hiện tại: chỉ phát sau thao tác người dùng,
  chỉnh thông số khi đang dừng không autoplay, dùng `update` cho thay đổi khi
  đang phát. Chuyển bài hoặc trang phải xử lý dừng và cleanup rõ ràng.

### Lộ trình examples từ đơn giản đến phức tạp

| Mức | Ví dụ dự kiến | Nội dung học |
| --- | --- | --- |
| Cơ bản | Một âm, bốn nốt, nốt dài và khoảng nghỉ | `pitch`, `sequence`, `weight`, `rest` |
| Nhịp điệu | Kick đều, snare backbeat, hi-hat có accent | `sample`, `repeat`, pattern điều khiển và phối hợp nhịp |
| Hòa âm | Bassline, chord và arpeggio | Cao độ, hợp âm và nhiều ô nhịp |
| Phối khí | Drum groove + bass + melody | `cat`, `stack` và cân bằng âm lượng |
| React | Player, mute/solo, đổi âm và tempo | `play`, `update` và React state |
| Tổng hợp | Dance Monkey và các đoạn nhạc tự sáng tác thuộc nhiều phong cách | Kết hợp các kỹ thuật đã học |

Mỗi ví dụ có một mục tiêu học rõ ràng. Đa dạng cả kỹ thuật, nhịp và phong cách,
không chỉ tăng độ dài code hoặc tập trung vào các bản phối hoàn chỉnh.
Dance Monkey là bài tổng hợp, đặt sau các ví dụ nhỏ về từng thành phần.

### Sound Cookbook: Phân loại âm thanh và cách triển khai

Nhóm nội dung dự kiến: **percussion** (kick, snare, hi-hat…), **bass**,
**lead**, **keys** và **pad**. Tách rõ ba việc: tạo chất âm, viết nhịp và
đưa âm đó vào bản phối.

Mỗi trang âm thanh có:

1. Nghe thử âm riêng lẻ.
2. Code tối thiểu, dùng các helper của kit một cách tường minh.
3. Giải thích từng thành phần tạo âm và đơn vị của thông số.
4. Các điều khiển tương tác để nghe sự khác biệt khi chỉnh thông số.
5. Một đoạn nhịp hoặc bản phối nhỏ sử dụng âm đó, liên kết đến example liên quan.

Các bài đầu tiên:

- **Kick:** sine wave, pitch sweep và amplitude decay; phân biệt envelope
  cao độ với envelope biên độ.
- **Snare:** white noise, filter và envelope để tạo tiếng đánh ngắn.
- **Hi-hat:** cùng nguồn white noise nhưng filter và decay khác snare;
  giải thích accent và pattern gain.
- **Bass và keys:** giải thích lựa chọn oscillator, cao độ, envelope và
  vai trò trong bản phối, sau các bài percussion đầu tiên.

Có thể bổ sung nhiều cách triển khai cùng một loại âm, như tổng hợp âm và
dùng sample khi API hỗ trợ. Ghi rõ cách dùng sample, yêu cầu tải dữ liệu và
giới hạn thực tế; không trình bày tính năng dự kiến như tính năng đã có.

### Nguyên tắc nội dung và code

- Code hiển thị phải lấy từ chính ví dụ đang chạy, tránh duy trì hai bản riêng
  cho tài liệu và playback. Chọn cơ chế chia sẻ source khi triển khai bài mẫu.
- Dạy bằng `pitch`, `rest`, `sequence`, `weight`, `repeat`, `sample`, `number`
  trước; giới thiệu `mini(...)` như lựa chọn bổ sung sau khi hiểu cấu trúc.
- Viết để người đọc hiểu: từng nốt, khoảng nghỉ, ô nhịp và bước chỉnh âm có
  giải thích. Không nén ví dụ bằng chuỗi ký hiệu hoặc abstraction khó theo dõi.
- Phân biệt `repeat` với `weight`, thời lượng tương đối với đơn vị tuyệt đối,
  và nhịp của pattern âm thanh với nhịp của pattern điều khiển.
- README và quickstart cần dùng cùng cách tiếp cận với bài học đầu tiên.
- Chỉ dùng API thực tế được hỗ trợ; API Reference dẫn đến example có thể chạy.

### Thứ tự implementation và tiêu chí hoàn thành

- [ ] Thiết kế template UI cho trang hướng dẫn, trang example và Sound Cookbook;
  kiểm tra bố cục desktop/mobile trước khi nhân rộng.
- [ ] Dựng khung điều hướng trong app hiện tại, tích hợp lại playground.
- [ ] Hoàn thiện bài “Bản nhạc đầu tiên” và trang example Dance Monkey làm mẫu;
  code hiển thị và playback dùng cùng source.
- [ ] Thêm các example cơ bản theo lộ trình và ba bài Cookbook đầu tiên:
  kick, snare, hi-hat; có liên kết qua lại giữa bài học và ví dụ.
- [ ] Mở rộng bass, keys, lead, pad và các ví dụ nhiều phong cách; bổ sung
  API Reference và đồng bộ README/quickstart theo API hiện hành.
- [ ] Kiểm tra điều hướng, responsive, keyboard và audio lifecycle;
  xác minh code mẫu chạy được, thông số thay đổi đúng như giải thích và
  playground hiện tại vẫn hoạt động.

## Tên tạm

`react-strudel-toolkit`

## Mục tiêu sản phẩm

Xây một package React/TypeScript giúp sử dụng Strudel dễ hơn và an toàn hơn về kiểu dữ liệu.

Vấn đề cần giải quyết không phải là thiếu một playground mới. Vấn đề chính là người dùng khó bắt đầu với Strudel vì API, pattern, Mini-Notation và tài liệu khó tra cứu; đồng thời việc tích hợp Strudel vào ứng dụng React hiện chưa có một abstraction rõ ràng, type-safe và dễ kiểm thử.

Package cần giúp developer:

1. khởi tạo và quản lý Strudel audio lifecycle trong React;
2. play, stop và thay đổi pattern qua một API ổn định;
3. nhận được types rõ ràng cho input, trạng thái và lỗi;
4. dùng package độc lập với editor hoặc UI cụ thể;
5. học và khám phá Strudel thông qua examples và reference app.

Playground hiện tại là **reference app**, dùng để kiểm tra trải nghiệm và làm ví dụ tích hợp package. Nó không phải sản phẩm chính.

## Ngoài phạm vi MVP

- Không hỗ trợ toàn bộ API Strudel ngay từ đầu.
- Không clone Strudel REPL.
- Không tự viết lại pattern engine, scheduler hoặc Mini-Notation parser.
- Không thêm account, cloud save, plugin system, MIDI, OSC hoặc visualizer phức tạp.
- Không bắt đầu bằng monorepo, documentation site hay release automation khi public API chưa ổn định.

## Nguyên tắc kỹ thuật

- Strudel xử lý pattern, scheduling và audio; package chỉ cung cấp integration layer cho React.
- Public API phải nhỏ, explicit và có types được kiểm tra bằng TypeScript.
- Tách core React hooks khỏi editor, Function Explorer và UI components.
- Không expose API nội bộ của REPL nếu `@strudel/web` hoặc package Strudel công khai đã đủ.
- Pin phiên bản `@strudel/*` và ghi nhận compatibility rõ ràng.
- Mọi lifecycle quan trọng phải có unit test trước khi xây UI phụ trợ.
- Chỉ thêm dependency khi nó giải quyết một vấn đề đã quan sát được.

## Kiến trúc mục tiêu

Trong giai đoạn đầu, giữ một Vite app để spike nhanh. Khi boundary của package đã rõ, chuyển sang cấu trúc tối thiểu:

```text
packages/
  react-strudel/
    src/
      StrudelProvider.tsx
      context.ts
      useStrudel.ts
      useTransport.ts
      types.ts
      errors.ts
    package.json

apps/
  playground/
    src/
      App.tsx
      components/

docs/
```

Chưa tạo các package `editor`, `function-registry`, `visualizer` hoặc `ui` cho đến khi có nhu cầu và boundary riêng thực sự xuất hiện.

## Public API dự kiến

Tên và chi tiết có thể thay đổi sau spike, nhưng contract cần hướng tới dạng:

```ts
type TransportStatus = 'idle' | 'playing' | 'error'

type StrudelInput = string | Pattern

type UseStrudelResult = {
  status: TransportStatus
  error: StrudelError | null
  play: (input: StrudelInput) => Promise<void>
  stop: () => void
}
```

```tsx
<StrudelProvider>
  <Player />
</StrudelProvider>
```

```tsx
function Player() {
  const { play, stop, status, error } = useStrudel()

  return (
    <>
      <button onClick={() => play('s("bd sd")')}>Play</button>
      <button onClick={stop}>Stop</button>
      <output>{status}</output>
      {error && <p>{error.message}</p>}
    </>
  )
}
```

Các quyết định cần chốt trước khi publish:

- `play` nhận code string, `Pattern`, hay hai API riêng biệt;
- package dùng `@strudel/web` trực tiếp hay adapter cho engine;
- error type và cách trả về location trong source;
- provider có sở hữu audio engine hay chỉ sở hữu transport;
- behavior khi nhiều component cùng gọi `play` hoặc `stop`;
- behavior dưới React Strict Mode và khi provider unmount.

## Milestone 0: Spike API Strudel

### Mục tiêu

Xác minh API thật của phiên bản `@strudel/web` đang pin và các assumption về audio lifecycle trước khi thiết kế abstraction.

### Việc cần làm

- Kiểm tra `initStrudel`, `evaluate` và `hush`.
- Xác minh `evaluate` nhận code string và trả lỗi như thế nào.
- Xác minh cách xử lý user gesture và browser audio permission.
- Ghi lại phiên bản Strudel và các API được package dùng.
- Giữ một reference implementation nhỏ trong playground.

### Hoàn thành khi

- Play/stop chạy được trong browser.
- Reload không làm app crash.
- Có danh sách API công khai được dùng, không phụ thuộc REPL internals.

## Milestone 1: Core React integration

Đây là milestone sản phẩm đầu tiên, không phải playground milestone.

### Việc cần làm

- Tách `useStrudel` khỏi `App` thành module có thể trở thành package core.
- Tạo `StrudelProvider` và Context nếu hook cần shared lifecycle.
- Định nghĩa `TransportStatus`, input type, error type và options.
- Quản lý một audio/transport lifecycle duy nhất trong provider.
- Đảm bảo play pattern mới không để pattern cũ tiếp tục phát.
- Xử lý user gesture, evaluate error và browser audio failure.
- Cleanup khi provider unmount.
- Giữ localStorage ở playground, không đưa persistence vào core package nếu chưa có lý do.

### Test bắt buộc

- provider mount/unmount;
- `play()` thành công cập nhật status;
- `play()` thất bại chuyển sang typed error state;
- `stop()` gọi nhiều lần không crash;
- play input mới hush pattern cũ;
- Strict Mode không tạo lifecycle hoặc scheduler thừa;
- storage hoặc browser capability không làm core hook crash.

### Hoàn thành khi

- Playground sử dụng core API thay vì gọi `@strudel/web` trực tiếp.
- Core có test lifecycle độc lập với UI.
- Types được kiểm tra bằng `tsc` và public API không phụ thuộc implementation detail của app.

## Milestone 2: Reference playground

Playground chỉ chứng minh package có thể sử dụng được trong một ứng dụng React thật.

### Việc cần làm

- Chuyển App sang import từ package local.
- Giữ editor dạng textarea trước.
- Play/Stop/Reset và error state.
- localStorage với fallback an toàn.
- README ghi lại cách cài và cách dùng API.

### Hoàn thành khi

- Một developer có thể nhìn playground và hiểu cách tích hợp package.
- Workflow sửa code -> play -> stop hoạt động.
- App không crash khi storage hoặc audio bị browser chặn.

## Milestone 3: Type-safe Strudel surface

Mục tiêu của milestone này là giảm khó khăn khi học và gọi Strudel API, nhưng không cố type lại toàn bộ Strudel bằng tay.

### Việc cần làm

- Khảo sát types public từ `@strudel/core`, `@strudel/mini` và `@strudel/tonal`.
- Xác định phần nào có thể re-export an toàn.
- Tạo types cho input, pattern, transport options và errors.
- Tạo helper hoặc factory có types rõ ràng nếu API gốc chưa thuận tiện.
- Viết examples TypeScript để kiểm tra inference và invalid usage.
- Dùng `tsd` hoặc cơ chế type-test tương đương nếu cần.

### Không làm

- Không tự định nghĩa một DSL mới.
- Không copy toàn bộ function registry thủ công.
- Không tuyên bố type-safe cho những API runtime mà Strudel không expose type information đáng tin cậy.

## Milestone 4: Documentation và discovery

Chỉ làm sau khi core API và types đã ổn định.

### Việc cần làm

- Guides cho các workflow phổ biến: setup, play/stop, lifecycle, error.
- Examples nhỏ cho `s`, `note`, `stack`, `fast`, `slow`, `lpf`, `room`.
- Function registry tối thiểu nếu tài liệu thực tế cho thấy cần search.
- Liên kết example với playground để người dùng có thể thử ngay.

Registry ban đầu có thể viết tay ở phạm vi nhỏ. Chỉ tự động hóa từ JSDoc hoặc metadata khi maintenance trở thành pain point thật.

## Milestone 5: Editor integration tùy chọn

CodeMirror là integration layer, không phải core package và không phải bước bắt buộc trước khi public API có giá trị.

Chỉ thêm khi có requirement cụ thể như:

- syntax highlighting;
- diagnostic theo dòng;
- autocomplete dựa trên types hoặc registry;
- command evaluate;
- inline documentation.

Editor phải giao tiếp với package qua input/output contract, không được sở hữu audio lifecycle.

## Milestone 6: Package release

Chỉ publish khi package đã được dùng thực tế qua playground hoặc một app khác.

### Việc cần làm

- Tách workspace tối thiểu `packages/react-strudel` và `apps/playground`.
- Build ESM/CJS nếu cần và generate declaration files.
- Đặt React làm `peerDependency`.
- Viết README API thực tế.
- Kiểm tra license và compatibility của các package Strudel.
- Thêm changeset và CI publish sau khi versioning strategy rõ ràng.

### Tiêu chí publish

- Public API nhỏ và có tài liệu.
- Có lifecycle, type và integration tests.
- Có app example chạy từ package đã build.
- Có compatibility matrix cho React và `@strudel/*`.
- Có quyết định license rõ ràng trước khi phát hành.

## Testing strategy

### Unit và type tests

- Core hooks, provider, errors và transport state bằng Vitest.
- React lifecycle bằng React Testing Library.
- Invalid input và public type inference bằng type tests.
- Mock Web Audio và `@strudel/web`; không phụ thuộc thiết bị âm thanh thật.

### Browser tests

Chỉ thêm Playwright khi core API đã ổn định, để kiểm tra reference playground:

- Play -> Stop.
- Sửa code -> Play lại.
- Error hiển thị và app vẫn hoạt động.
- Reload giữ snippet ở playground.

Không test lại logic của Strudel. Chỉ test integration do package sở hữu.

## Rủi ro

### API Strudel thay đổi

Pin version, tránh API nội bộ, ghi rõ compatibility và cô lập adapter trong một module.

### Type-safe không đồng nghĩa với type lại toàn bộ runtime

Chỉ đảm bảo types cho boundary mà package sở hữu. Những phần Strudel không có metadata đáng tin cậy cần được ghi rõ là runtime-only hoặc experimental.

### Audio lifecycle phức tạp

Tập trung test user gesture, Strict Mode, nhiều lần play/stop và cleanup trước khi thêm UI hoặc feature discovery.

### Scope phình to

Mỗi feature mới phải trả lời: nó giúp developer tích hợp, học hoặc sử dụng Strudel type-safe hơn như thế nào? Nếu không, đưa vào backlog.

### License

Kiểm tra license của `@strudel/*` và dependency trước khi publish. Không chờ đến bước release mới quyết định nghĩa vụ license.

## Trạng thái hiện tại và bước kế tiếp

Đã có:

- Vite React TypeScript app làm reference playground.
- Spike `@strudel/web` với play/stop.
- `useStrudel` sơ bộ.
- localStorage fallback an toàn.
- Vitest và test lifecycle cơ bản.

Việc tiếp theo nên làm:

1. Chốt `StrudelInput`, `StrudelError`, `TransportStatus` và `UseStrudelResult`.
2. Tạo `StrudelProvider` hoặc xác nhận hook hiện tại chưa cần provider ở MVP.
3. Chuyển playground sang dùng boundary package thay vì import Strudel trực tiếp.
4. Thêm type tests cho public API.
5. Chỉ sau đó mới quyết định workspace/package build.

## Backlog

- CodeMirror adapter.
- Function registry và Function Explorer.
- Autocomplete dựa trên metadata.
- Share snippet bằng URL.
- Sample browser.
- Visualizer, punchcard và scope.
- MIDI/OSC adapters.
- Astro/Starlight documentation site.
- Storybook, Changesets và automated release.

## Definition of Done

Một milestone được xem là xong khi:

- boundary hoặc feature chạy được trong reference app;
- có test logic và lifecycle tương ứng;
- public types không làm lộ implementation detail không cần thiết;
- lỗi chính đã được xử lý;
- docs được cập nhật nếu API thay đổi;
- không còn TODO blocking trong luồng chính;
- developer có thể dùng lại API trong một component React mới mà không cần đọc source implementation.

## Kết luận

Sản phẩm là **package React/TypeScript type-safe cho Strudel**.

Playground, editor và Function Explorer là các consumer hoặc integration layer phục vụ mục tiêu đó. Thứ tự ưu tiên vì vậy là:

```text
Strudel API spike
  -> core React lifecycle
  -> public types và type tests
  -> reference playground
  -> docs/examples
  -> editor/discovery integrations
  -> package release
```
