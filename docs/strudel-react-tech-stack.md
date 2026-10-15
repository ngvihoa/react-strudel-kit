# Tech Stack cho thư viện React hỗ trợ Strudel

> **Tài liệu thiết kế ban đầu, giữ để tham khảo.** Các đề xuất dưới đây không phản ánh đầy đủ trạng thái triển khai hiện tại. Xem [usage guide](usage.md) và [README](../README.md) để dùng API đang được hỗ trợ.

## 1. Mục tiêu

Xây một thư viện React giúp cộng đồng sử dụng Strudel dễ hơn thông qua hooks, components, editor, function explorer và tài liệu tương tác.

Nguyên tắc chính:

- React layer quản lý UI, state và lifecycle.
- Strudel xử lý pattern, scheduling và audio.
- Tách audio engine khỏi UI để người dùng có thể dùng hooks độc lập với editor.
- Pin phiên bản Strudel để tránh breaking changes ngoài ý muốn.

## 2. Stack đề xuất

### Core

- **TypeScript** với `strict: true`.
- **React 18/19**, khai báo dưới dạng `peerDependencies`.
- **`@strudel/web`** làm điểm vào cho audio engine trong browser.
- **`@strudel/core`**, **`@strudel/mini`** và **`@strudel/tonal`** khi cần dùng trực tiếp các package tương ứng.
- **Web Audio API** để kiểm tra capability và quản lý audio lifecycle.

### Build và phát hành

- **pnpm workspaces** cho monorepo.
- **Vite library mode** hoặc **tsup** để build ESM và TypeScript declarations.
- **Changesets** để quản lý version và changelog.
- **ESLint + Prettier** cho kiểm tra và định dạng code.
- **npm provenance hoặc CI publish** để phát hành package có thể truy xuất nguồn build.

### React integration

- `StrudelProvider` dùng React Context.
- Custom hooks:
  - `useStrudel()`
  - `useTransport()`
  - `usePattern()`
  - `useAudioEngine()`
- Chưa cần Redux hoặc Zustand trong MVP. Context và hooks đủ cho audio lifecycle, transport và pattern state.
- Có thể bổ sung **Zustand** khi mixer, editor, visualizer và sample browser cần state dùng chung phức tạp hơn.

### Editor

- **CodeMirror 6** vì nhẹ và dễ mở rộng.
- Các tính năng nên hỗ trợ:
  - syntax highlighting cho JavaScript và Mini-Notation
  - autocomplete function
  - inline documentation
  - active-event highlighting
  - error diagnostics
- Không nên phụ thuộc editor vào audio engine; editor chỉ phát ra code hoặc pattern mới.

### Documentation và playground

- **Astro + Starlight** cho documentation API và guides.
- **Vite + React** cho playground độc lập.
- **Storybook** cho component và interactive examples.
- Chỉ dùng Next.js nếu website cần SSR, blog, authentication hoặc các tính năng ứng dụng đầy đủ.

### Testing

- **Vitest** cho unit test của hooks, API registry và lifecycle.
- **React Testing Library** cho component React.
- **Playwright** cho browser integration, editor, play/stop và visualizer.
- Dùng abstraction hoặc mock cho Web Audio trong unit test; không phụ thuộc thiết bị âm thanh thật.

Các trường hợp bắt buộc phải test:

- mount và unmount `StrudelProvider`
- play/stop nhiều lần
- cleanup `AudioContext`
- thay đổi pattern khi đang phát
- browser không hỗ trợ Web Audio hoặc MIDI
- React Strict Mode
- user gesture bắt buộc trước khi khởi động audio

## 3. Cấu trúc monorepo đề xuất

```text
packages/
  react-strudel/       # Provider, hooks và public React API
  function-registry/   # Metadata, search và TypeScript types cho function
  editor/              # CodeMirror integration
  visualizer/          # Punchcard, scope và pattern visualization
  ui/                  # Components dùng chung, nếu cần

apps/
  docs/                # Astro + Starlight
  playground/          # Vite React playground
```

MVP có thể bắt đầu chỉ với:

```text
packages/react-strudel/
apps/playground/
```

Chỉ tách package khi ranh giới và API đã rõ ràng.

## 4. API React dự kiến

```tsx
import { StrudelProvider, useStrudel } from "@your-scope/react-strudel";

function Player() {
  const { play, stop, isPlaying } = useStrudel();

  return (
    <>
      <button onClick={() => play('s("bd sd")')}>Play</button>
      <button onClick={stop}>Stop</button>
      <span>{isPlaying ? "Playing" : "Stopped"}</span>
    </>
  );
}

export function App() {
  return (
    <StrudelProvider>
      <Player />
    </StrudelProvider>
  );
}
```

API nên hỗ trợ cả code string và pattern đã tạo sẵn, nhưng cần phân biệt rõ hai luồng này trong type:

```ts
type StrudelInput = string | Pattern;
```

Provider cần đảm bảo:

- khởi tạo audio engine một lần
- không tạo nhiều scheduler ngoài ý muốn
- dọn dẹp tài nguyên khi unmount
- xử lý React Strict Mode
- báo lỗi khi browser chưa cho phép audio

## 5. API registry và Function Explorer

Không nên duy trì danh sách function thủ công. Có thể xây pipeline từ JSDoc hoặc metadata của Strudel:

```text
Strudel source
  -> JSDoc / doc.json
  -> normalized API registry
  -> TypeScript types
  -> autocomplete
  -> Function Explorer
  -> searchable documentation
```

Kiểu dữ liệu gợi ý:

```ts
type StrudelFunction = {
  name: string;
  aliases: string[];
  category: string;
  package: string;
  kind: "constructor" | "modifier" | "parameter" | "output";
  parameters: Parameter[];
  examples: Example[];
  equivalentNotation?: string;
  stability?: "stable" | "experimental" | "deprecated";
};
```

Function Explorer nên cho phép tìm theo:

- tên function và alias
- category
- package
- loại function
- tham số
- Mini-Notation tương đương
- trạng thái ổn định hoặc experimental

## 6. Package Strudel liên quan

| Nhu cầu | Package |
| --- | --- |
| Pattern engine | `@strudel/core` |
| Mini-Notation | `@strudel/mini` |
| Tonal functions | `@strudel/tonal` |
| Browser audio | `@strudel/webaudio` |
| Strudel không có UI | `@strudel/web` |
| REPL web component | `@strudel/repl` |
| Embed bằng iframe | `@strudel/embed` |
| MIDI | `@strudel/midi` |
| OSC | `@strudel/osc` |

Package React cũ `@strudel.cycles/react` được tài liệu Strudel đánh dấu là không còn duy trì. Không nên lấy package này làm nền tảng cho thư viện mới.

Tham khảo: [Strudel Packages](https://strudel.cc/technical-manual/packages/), [Using Strudel in your Project](https://strudel.cc/technical-manual/project-start/)

## 7. Lộ trình MVP

### Giai đoạn 1: Audio lifecycle

- `StrudelProvider`
- `useStrudel`
- play, stop, hush
- cleanup và xử lý user gesture
- một playground tối giản

### Giai đoạn 2: Editor

- CodeMirror 6
- evaluate code
- hiển thị lỗi
- autocomplete cơ bản
- thay đổi pattern khi đang phát

### Giai đoạn 3: API discovery

- API registry
- Function Explorer
- examples có thể play
- liên kết giữa function và Mini-Notation

### Giai đoạn 4: Visualization

- active event highlighting
- punchcard hoặc timeline
- scope và spectrum
- visualizer độc lập với audio engine

### Giai đoạn 5: Advanced outputs

- MIDI
- OSC
- routing và orbit controls
- các output adapter tùy chọn

## 8. License và phát hành

Luôn xác định và áp dụng đúng license trước khi phát hành package hoặc ứng dụng sử dụng Strudel.

Checklist:

- Kiểm tra license của từng package `@strudel/*` và dependency trực tiếp.
- Phân biệt sử dụng package nguyên bản, sửa đổi source và tác phẩm phái sinh.
- Kiểm tra tính tương thích giữa license của Strudel, dependency và thư viện React.
- Giữ copyright notice, license notice và thông tin thay đổi theo yêu cầu.
- Nếu phân phối code Strudel đã sửa đổi, chuẩn bị cung cấp source code tương ứng theo nghĩa vụ của AGPL-3.0.
- Ghi license của thư viện trong `package.json`, README và file `LICENSE`.
- Không công bố thư viện dưới MIT hoặc Apache-2.0 nếu nội dung phân phối không đáp ứng điều kiện của license đó.
- Khi chưa chắc về quan hệ phái sinh hoặc nghĩa vụ AGPL, cần kiểm tra với chuyên gia pháp lý trước khi publish.

Strudel sử dụng **AGPL-3.0**. Tham khảo [Using Strudel in your Project](https://strudel.cc/technical-manual/project-start/) và văn bản [AGPL-3.0](https://www.gnu.org/licenses/agpl-3.0.html).

## 9. Stack MVP kết luận

```text
TypeScript
React 18/19
@strudel/web
Vite
pnpm workspaces
CodeMirror 6
Vitest
React Testing Library
Playwright
Astro + Starlight
Changesets
ESLint + Prettier
```

Lựa chọn thực tế nhất là bắt đầu với `TypeScript + React + @strudel/web + Vite + CodeMirror 6 + Vitest`. Sau khi core workflow ổn định, bổ sung API registry, Storybook, visualizer và các output adapter.
