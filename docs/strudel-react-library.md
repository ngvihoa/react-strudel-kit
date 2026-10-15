# Strudel API và định hướng thư viện React

> **Tài liệu thiết kế ban đầu, giữ để tham khảo.** Các đề xuất dưới đây không phản ánh đầy đủ trạng thái triển khai hiện tại. Xem [usage guide](usage.md) và [README](../README.md) để dùng API đang được hỗ trợ.

## 1. Strudel là gì?

Strudel là môi trường lập trình âm nhạc trực tiếp trên trình duyệt. Người dùng viết JavaScript và Mini-Notation để tạo pattern nhịp điệu, giai điệu, sample, synthesizer và audio effects trong lúc nhạc đang chạy.

Strudel là bản port pattern language của Tidal Cycles sang JavaScript. Môi trường chính là [Strudel REPL](https://strudel.cc/), nhưng Strudel cũng có thể được dùng như các package npm trong ứng dụng web.

## 2. Bản đồ API

### 2.1. Tạo pattern

Các pattern constructor chính:

```js
cat()
seq()
stack()
stepcat()
arrange()
polymeter()
silence
run()
binary()
binaryN()
```

| Hàm | Mini-Notation tương đương | Ý nghĩa |
| --- | --- | --- |
| `cat(a, b)` | `<a b>` | Mỗi phần chiếm một cycle |
| `seq(a, b)` | `a b` | Nén các phần vào một cycle |
| `stack(a, b)` | `a,b` | Chạy song song |
| `silence` | `~` | Im lặng |

Ví dụ:

```js
stack(
  s("bd sd"),
  note("c3 e3 g3")
)
```

Nguồn: [Pattern Functions](https://strudel.cc/functions/intro/), [Creating Patterns](https://strudel.cc/learn/factories/)

### 2.2. Control parameters

Các hàm gắn ý nghĩa cho giá trị của event:

```js
note()
n()
s()
sound()
freq()
gain()
velocity()
pan()
cutoff()
lpf()
hpf()
orbit()
```

Các hàm này nhận được giá trị tĩnh hoặc một `Pattern` khác:

```js
s("bd*8")
  .gain(sine.range(0.2, 1).slow(4))
```

Nguồn: [Control Parameters](https://strudel.cc/functions/value-modifiers/)

### 2.3. Biến đổi thời gian

```js
slow()
fast()
early()
late()
clip()
euclid()
euclidRot()
rev()
palindrome()
iter()
ply()
segment()
compress()
zoom()
linger()
fastGap()
inside()
outside()
cpm()
ribbon()
swing()
swingBy()
```

Ví dụ:

```js
s("bd hh sd hh")
  .fast(2)
  .swing(4)
```

Nguồn: [Time Modifiers](https://strudel.cc/learn/time-modifiers/)

### 2.4. Pattern ngẫu nhiên

```js
choose()
wchoose()
chooseCycles()
wchooseCycles()
degrade()
degradeBy()
undegrade()
sometimes()
sometimesBy()
someCycles()
often()
rarely()
always()
never()
```

Ví dụ:

```js
s("bd hh sd cp")
  .sometimes(x => x.rev())
```

Nguồn: [Random Modifiers](https://strudel.cc/learn/random-modifiers/)

### 2.5. Pattern điều kiện

```js
when()
firstOf()
lastOf()
chunk()
arp()
struct()
mask()
reset()
restart()
hush()
invert()
pick()
pickF()
inhabit()
squeeze()
```

Ví dụ:

```js
s("bd hh sd cp")
  .every(4, x => x.rev())
```

Nguồn: [Conditional Modifiers](https://strudel.cc/learn/conditional-modifiers/)

### 2.6. Sample

```js
s()
sound()
bank()
n()
samples()
soundAlias()
```

Sample modifiers:

```js
begin()
end()
loop()
loopBegin()
loopEnd()
cut()
clip()
loopAt()
fit()
chop()
striate()
slice()
splice()
scrub()
speed()
```

Ví dụ:

```js
s("breaks165")
  .fit()
  .slice(8, "0 1 2 3 4 5 6 7")
  .speed("<1 1.2 .8>")
```

Nguồn: [Samples](https://strudel.cc/learn/samples/)

### 2.7. Synthesizer

Waveform cơ bản:

```js
s("sine")
s("sawtooth")
s("square")
s("triangle")
s("white")
s("pink")
s("brown")
```

Các nhóm nâng cao:

- FM synthesis: `fm()`, `fmh()`, `fmattack()`, `fmdecay()`
- Additive synthesis: `partials()`, `phases()`
- Vibrato: `vib()`, `vibmod()`
- Wavetable: sample có tiền tố `wt_`
- ZZFX

Nguồn: [Synths](https://strudel.cc/learn/synths/)

### 2.8. Audio effects

Filter:

```js
lpf()
lpq()
hpf()
hpq()
bpf()
bpq()
vowel()
```

Amplitude envelope:

```js
attack()
decay()
sustain()
release()
adsr()
```

Pitch envelope:

```js
penv()
pattack()
pdecay()
prelease()
```

Dynamics, panning và waveshaping:

```js
gain()
velocity()
compressor()
postgain()
pan()
jux()
juxBy()
crush()
coarse()
distort()
```

Delay, reverb và modulation:

```js
delay()
delaytime()
delayfeedback()
room()
roomsize()
roomfade()
phaser()
```

Nguồn: [Audio Effects](https://strudel.cc/learn/effects/)

### 2.9. Nhạc lý

```js
scale()
transpose()
scaleTranspose()
rootNotes()
voicing()
chord()
```

Ví dụ:

```js
n("0 2 4 6")
  .scale("C:minor")
  .s("piano")
```

Nguồn: [Tonal Functions](https://strudel.cc/learn/tonal/)

### 2.10. Input và output

```js
midi()
midin()
midikeys()
midichan()
ccn()
ccv()
midicmd()
osc()
mqtt()
```

Nguồn: [MIDI, OSC and MQTT](https://strudel.cc/learn/input-output/)

## 3. Mini-Notation cần hỗ trợ

Mini-Notation là cú pháp ngắn để mô tả pattern:

| Ký hiệu | Ý nghĩa |
| --- | --- |
| Dấu cách | Chuỗi tuần tự |
| `,` | Phát song song hoặc hợp âm |
| `~`, `-` | Khoảng lặng |
| `[]` | Nhóm và chia nhỏ thời gian |
| `<>` | Thay phiên qua các cycle |
| `*` | Tăng tốc hoặc lặp trong cycle |
| `/` | Kéo dài qua nhiều cycle |
| `@` | Gán trọng số thời gian |
| `!` | Lặp mà không đổi tốc độ |
| `?` | Xác suất giữ event |
| `(beats, steps)` | Euclidean rhythm |

Ví dụ:

```js
note("<[c3,e3,g3] [d3,f3,a3]>*2")
```

Nguồn: [Mini-Notation](https://strudel.cc/learn/mini-notation/)

## 4. Package nên dùng cho thư viện React

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

Nguồn: [Strudel Packages](https://strudel.cc/technical-manual/packages/), [Using Strudel in your Project](https://strudel.cc/technical-manual/project-start/)

Package React cũ `@strudel.cycles/react` được tài liệu đánh dấu là không còn duy trì. Thư viện mới nên xây một lớp React trên các package Strudel hiện tại thay vì phụ thuộc vào package cũ.

## 5. Kiến trúc thư viện React đề xuất

API ở mức React có thể gồm:

```ts
import {
  useStrudel,
  usePattern,
  useTransport,
  useAudioEngine,
} from "@your-scope/react-strudel";
```

Ví dụ sử dụng:

```tsx
const { play, stop } = useStrudel();

play(
  note("c3 e3 g3")
    .s("sawtooth")
    .fast(2)
);
```

Các component có thể cung cấp:

```tsx
<StrudelProvider>
  <TransportControls />
  <PatternEditor />
  <PatternVisualizer />
  <FunctionExplorer />
  <SampleBrowser />
</StrudelProvider>
```

### MVP nên ưu tiên

1. `StrudelProvider` để khởi tạo và dọn dẹp audio engine.
2. `useStrudel` cho `play`, `stop`, `hush` và trạng thái transport.
3. `usePattern` để quản lý pattern và cập nhật pattern đang chạy.
4. Code editor hỗ trợ Mini-Notation.
5. Function Explorer có tìm kiếm theo tên, nhóm và package.
6. Interactive examples cho từng function.
7. Visualizer hoặc punchcard cho pattern.
8. TypeScript types rõ ràng cho các parameter và function.

## 6. API registry cho Function Explorer

Không nên duy trì danh sách hàm thủ công. Strudel đã dùng JSDoc trong source code và sinh `doc.json`.

Có thể xây pipeline:

```text
Strudel source
  -> JSDoc / doc.json
  -> normalized API registry
  -> TypeScript types
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

Nguồn: [Strudel Docs internals](https://strudel.cc/technical-manual/docs/)

## 7. Ranh giới kỹ thuật nên giữ

- React layer chỉ quản lý lifecycle, state, event handlers và UI.
- Pattern engine nên để Strudel xử lý.
- Không nên clone lại parser Mini-Notation nếu không cần thiết.
- Không nên gọi API nội bộ của REPL nếu package công khai đã đáp ứng nhu cầu.
- Cần pin phiên bản Strudel trong production để tránh thay đổi API ngoài ý muốn.
- Cần kiểm tra tương thích browser, đặc biệt với Web Audio và MIDI.
- Các chức năng experimental nên được đánh dấu rõ trong API registry.

## 8. License

Strudel sử dụng AGPL-3.0. Trước khi phát hành thư viện có đóng gói hoặc sửa đổi code Strudel, cần đọc kỹ license và xem xét nghĩa vụ phân phối source code cũng như tính tương thích license của ứng dụng tích hợp.

### Nguyên tắc áp dụng license

Luôn xác định và áp dụng đúng license trước khi phát hành bất kỳ package hoặc ứng dụng nào sử dụng Strudel. Không xem license là việc bổ sung sau cùng.

Checklist trước mỗi lần publish:

- Xác định package Strudel nào được sử dụng và license của từng package.
- Phân biệt rõ giữa việc sử dụng package nguyên bản, sửa đổi source và tạo tác phẩm phái sinh.
- Kiểm tra license của toàn bộ dependency và tính tương thích với license dự định dùng cho dự án.
- Đưa file `LICENSE` phù hợp vào repository hoặc package distribution.
- Giữ lại copyright notice, license notice và thông tin thay đổi theo yêu cầu của dependency.
- Nếu phân phối code Strudel đã sửa đổi, chuẩn bị cung cấp source code tương ứng theo nghĩa vụ của AGPL-3.0.
- Ghi rõ license của thư viện React trong `package.json` và tài liệu README.
- Không tuyên bố thư viện là MIT, Apache-2.0 hoặc license khác nếu nội dung được phân phối không đáp ứng điều kiện của license đó.
- Khi chưa chắc về quan hệ phái sinh hoặc nghĩa vụ AGPL, cần kiểm tra với người có chuyên môn pháp lý trước khi phát hành.

Nguồn: [Using Strudel in your Project](https://strudel.cc/technical-manual/project-start/)

## 9. Nguồn tham khảo chính

- [Strudel REPL](https://strudel.cc/)
- [Getting Started](https://strudel.cc/workshop/getting-started/)
- [First Sounds](https://strudel.cc/workshop/first-sounds/)
- [Pattern Functions](https://strudel.cc/functions/intro/)
- [Creating Patterns](https://strudel.cc/learn/factories/)
- [Mini-Notation](https://strudel.cc/learn/mini-notation/)
- [Samples](https://strudel.cc/learn/samples/)
- [Synths](https://strudel.cc/learn/synths/)
- [Audio Effects](https://strudel.cc/learn/effects/)
- [Tonal Functions](https://strudel.cc/learn/tonal/)
- [MIDI, OSC and MQTT](https://strudel.cc/learn/input-output/)
- [Strudel Packages](https://strudel.cc/technical-manual/packages/)
- [Using Strudel in your Project](https://strudel.cc/technical-manual/project-start/)
