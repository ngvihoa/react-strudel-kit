# Kế hoạch phát hành npm

Cập nhật 2026-11-04. Đây là kế hoạch release hiện hành; các milestone ban đầu
trong `implementation-plan.md` được giữ để tham khảo.

## Quyết định đã chốt

- Tên: `react-strudel-kit`, không có scope, theo lựa chọn của người dùng.
- License: `AGPL-3.0-or-later`, theo yêu cầu chọn license phù hợp với Strudel.
  Hai dependency trực tiếp `@strudel/web@1.3.0` và `@strudel/mini@1.2.6` khai báo
  license này. Xem [hướng dẫn upstream](https://strudel.cc/technical-manual/project-start/).
- Bản đầu: `0.1.0`, đã phát hành ngày 2026-11-04; ESM với hai entrypoint
  `react-strudel-kit` và `react-strudel-kit/react`.
- Root workspace/reference app tiếp tục `private: true`; chỉ package được phát hành.
- Website: `https://react-strudel-kit.vercel.app/`; npm homepage trỏ đến website,
  repository/bugs trỏ đến GitHub. README npm có logo RSK và link Learn/API/Examples.
- Mỗi phần hoàn thành có kiểm tra và commit riêng.

## 1. Đồng bộ trạng thái và lập kế hoạch

- [x] Ghi nhận người dùng duyệt chất âm hiện tại; không suy diễn thành kiểm chứng
  trên mọi thiết bị hoặc đo clipping.
- [x] Đọc cấu hình build, exports, test consumer hiện có và tài liệu npm/upstream.
- [x] Hỏi và chốt tên cùng hướng license với người dùng.
- [x] Kiểm tra registry: tên hiện trả 404 ngày 2026-11-04. Đây không phải đặt chỗ
  hay bảo đảm tên còn dùng được khi publish.
- [x] Kiểm tra auth: ban đầu E401; người dùng đăng nhập và `npm whoami` xác nhận `ngvihoa`.

## 2. Đóng gói và tài liệu cho người cài

- [x] Thêm LICENSE, metadata repository/bugs/homepage và README ngay trong package.
- [x] Giới hạn file tarball: ESM, declarations/maps và production source để tra cứu;
  loại test, mock, config và source của reference app.
- [x] Build sạch trước mỗi lần pack để không lấy output cũ.
- [x] Xem manifest thực tế của `npm pack`, kiểm tra các đích của exports tồn tại.
- [x] Kèm logo trong `assets/`, dùng URL ảnh tuyệt đối trong README để hiển thị
  trên npm; bổ sung link website/docs/GitHub/issues và license.

Phát hiện ban đầu: `npm pack --dry-run` lấy 33 file source/test/config và không
lấy `dist` do kế thừa `.gitignore`. Các entrypoint vì thế trỏ đến file vắng mặt.
Package chưa có README/license riêng. Đây là lỗi cần sửa trước khi publish.

## 3. Kiểm thử consumer độc lập

- [x] Tạo tarball thật; cài vào thư mục tạm bên ngoài workspace, không dùng alias,
  symlink package, ambient shim của app hoặc node_modules của repo để resolve kit.
- [x] Typecheck public API với `skipLibCheck: false`; kiểm tra usage hợp lệ và sai kiểu.
- [x] Build app React/Vite từ tarball; kiểm tra runtime thực trong Chromium:
  mount không autoplay, Play, live update, Stop và unmount consumer cuối.
- [x] Kiểm tra React 18 và 19 trước khi xác nhận peer range; ghi đúng phiên bản đã chạy.
- [x] Ghi lại lệnh tái lập và giới hạn xác minh trong `docs/validation.md`.

## 4. CI và chuẩn bị bản phát hành

- [x] Thêm workflow CI cho lint, typecheck/build, Vitest, browser tests và tarball
  consumer. Hosted CI trên Node 24 qua tại commit `7210778`.
- [x] Changelog `0.1.0`, README hướng dẫn cài, giới hạn browser/ESM và compatibility.
- [x] Chạy đầy đủ kiểm tra local; kiểm tra nội dung tarball và metadata lần cuối.
  187 unit tests, 45 browser tests, lint/typecheck/build và hai tarball consumer qua.
- [x] Bỏ `private: true` ở package; root giữ nguyên private. Chỉ publish tarball đã
  qua kiểm thử, không publish từ root.

## 5. Phát hành và xác minh registry

- [x] Người dùng đăng nhập npm bằng `npm login`; `npm whoami` xác nhận `ngvihoa`.
  Không gửi token, mật khẩu hoặc mã OTP vào chat hay commit.
- [x] Chốt `0.1.0`, dist-tag `latest` và tài khoản `ngvihoa`; kiểm tra tên ngay trước release.
- [x] `npm publish` dry-run với bản `0.1.0`, public access và dist-tag `latest` qua;
  không gửi bản phát hành lên registry.
- [x] Đối chiếu `npm publish --dry-run` với artifact đã kiểm thử, rồi publish đúng
  tarball đó với public access. Ghi lại version, integrity và commit nguồn.
- [x] Cài bản từ npm vào consumer sạch; xác nhận metadata, types, build và playback.
  Chạy `npm run test:package -- --registry`: cài version từ npm và so sánh integrity
  với tarball local, rồi chạy lại các kiểm tra consumer React 18/19.
- [x] Tag Git `v0.1.0` tại commit nguồn `7210778`; cập nhật trạng thái sau khi registry xác nhận.

Các lần phát hành sau có thể dùng npm trusted publishing qua GitHub Actions.
Chưa cấu hình publish tự động; bản đầu dùng CLI và người dùng hoàn tất xác thực
publish trong trình duyệt npm.

## Bản vá README 0.1.1 — 2026-11-04

- Người dùng chỉ ra hướng dẫn kiểm thử tarball nội bộ bị đưa vào README npm.
  Đã chuyển hướng dẫn đó sang release guide này, rút gọn phần compatibility và
  bỏ chi tiết môi trường kiểm thử khỏi README dành cho người cài package.
- Npm yêu cầu publish version mới để cập nhật README; bản vá `0.1.1` được phát
  hành từ commit `3f6cf8dcfd327511facb126848a1446c56ca6894`, tag `v0.1.1`.
- [Hosted CI](https://github.com/ngvihoa/react-strudel-kit/actions/runs/41838565274)
  qua. Cài từ registry trên React 18/19 qua types, build và playback/cleanup.
- Registry xác nhận `latest: 0.1.1`, integrity khớp tarball đã kiểm thử và README
  không còn hướng dẫn release. Logo, website, GitHub và Issues giữ nguyên.
- So sánh tarball với `0.1.0`: chỉ README, CHANGELOG và version trong package.json
  thay đổi; runtime, production source, declarations, license và logo giống từng byte.

## Kết quả bản 0.1.0 — 2026-11-04

- [npm package](https://www.npmjs.com/package/react-strudel-kit) và
  [website](https://react-strudel-kit.vercel.app/).
- Commit nguồn: `7210778645dfebdf8c8783d9eb00f44897bb2ecc`.
- [Hosted CI thành công](https://github.com/ngvihoa/react-strudel-kit/actions/runs/41835342237):
  lint, 187 unit tests, typecheck/build, tarball consumers React 18/19, 45 browser tests.
- Registry xác nhận version `0.1.0`, `latest: 0.1.0`, metadata website/repository/issues
  và README có logo/link. Cài từ registry qua kiểm tra types, production build và
  Play/Update/Stop/unmount trên cả React 18.3.1 lẫn 19.3.0.
- Tarball: 48 files, 67,936 bytes; integrity khớp bản đã kiểm thử:
  `sha512-Uib1kPhknBZ8CwcYbQnwDPYcjZJMzEeH5I8aHB+pcPr1P+2MsE99W6Bu4AmJ/pePYs3WhPPUQ29DnI1S1cAz7Q==`.
- Các link README đã trả HTTP 200; browser xác nhận direct visit và reload của
  Learn/API/Cookbook/Examples/Playground trên Vercel sau khi thêm SPA rewrite.

## Quy trình tái lập

### Thử tarball local khi chuẩn bị release

Hướng dẫn này dành cho người phát triển package. README trên npm chỉ hướng dẫn
người dùng cài từ registry và tích hợp vào app React.

```sh
# Từ root repository; prepack build ESM và declarations trước khi pack.
npm pack --workspace=react-strudel-kit --pack-destination /tmp

# Từ app React độc lập, cài tarball của version đang chuẩn bị phát hành.
npm install /tmp/react-strudel-kit-0.1.1.tgz
```

### Kiểm tra trước khi phát hành

Chạy từ root (Node 24.15+, Chromium đã cài):

```sh
npm ci
npm run lint
npm test -- --run
npm run typecheck
npm run test:e2e
npm run test:package
```

`test:e2e` build production site. `test:package` build rồi pack và kiểm thử chính
tarball đó trên React 18/19; khi thành công, giữ bản đã thử tại
`artifacts/react-strudel-kit-0.1.1.tgz`, kèm `package-validation.json` ghi integrity,
commit, trạng thái tracked files và phiên bản toolchain. Thư mục artifacts bị
Git ignore; CI upload artifact để tải về, không tự publish. Muốn tái lập đầy đủ,
chạy từ commit sạch; `AGENTS.md` chưa tracked của người dùng không được đưa vào tarball.

Sau khi kiểm tra đầy đủ và đã đăng nhập đúng npm account:

```sh
npm whoami --registry=https://registry.npmjs.org
npm view react-strudel-kit version --registry=https://registry.npmjs.org
npm publish ./artifacts/react-strudel-kit-0.1.1.tgz --access public --tag latest --dry-run --ignore-scripts
# Thực hiện khi sẵn sàng phát hành; version trên npm không thể ghi đè.
npm publish ./artifacts/react-strudel-kit-0.1.1.tgz --access public --tag latest --ignore-scripts
npm view react-strudel-kit@0.1.1 version dist.integrity --registry=https://registry.npmjs.org
```

Nếu tên đã có người dùng hoặc version tồn tại, dừng và kiểm tra quyền/version;
không đổi tên hay tăng version tự động. So sánh `dist.integrity` với artifact đã
kiểm thử. Tài liệu npm mô tả [publish từ tarball và dry-run](https://docs.npmjs.com/cli/v11/commands/npm-publish/).
Sau khi publish thành công, đổi phần release status trong README/changelog và
kiểm thử cài package từ registry trước khi gắn tag Git.

## Tài liệu đối chiếu

- [npm package.json: files, license, exports, private, publishConfig](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/)
- [npm pack](https://docs.npmjs.com/cli/v11/commands/npm-pack/)
- [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/)
- [Strudel integration/license](https://strudel.cc/technical-manual/project-start/)
