# Kế hoạch phát hành npm

Cập nhật 2026-11-04. Đây là kế hoạch release hiện hành; các milestone ban đầu
trong `implementation-plan.md` được giữ để tham khảo.

## Quyết định đã chốt

- Tên: `react-strudel-kit`, không có scope, theo lựa chọn của người dùng.
- License: `AGPL-3.0-or-later`, theo yêu cầu chọn license phù hợp với Strudel.
  Hai dependency trực tiếp `@strudel/web@1.3.0` và `@strudel/mini@1.2.6` khai báo
  license này. Xem [hướng dẫn upstream](https://strudel.cc/technical-manual/project-start/).
- Bản đầu đề xuất: `0.1.0` (version hiện có), ESM với hai entrypoint
  `react-strudel-kit` và `react-strudel-kit/react`.
- Root workspace/reference app tiếp tục `private: true`; chỉ package được phát hành.
- Mỗi phần hoàn thành có kiểm tra và commit riêng.

## 1. Đồng bộ trạng thái và lập kế hoạch

- [x] Ghi nhận người dùng duyệt chất âm hiện tại; không suy diễn thành kiểm chứng
  trên mọi thiết bị hoặc đo clipping.
- [x] Đọc cấu hình build, exports, test consumer hiện có và tài liệu npm/upstream.
- [x] Hỏi và chốt tên cùng hướng license với người dùng.
- [x] Kiểm tra registry: tên hiện trả 404 ngày 2026-11-04. Đây không phải đặt chỗ
  hay bảo đảm tên còn dùng được khi publish.
- [x] Kiểm tra auth: `npm whoami` trả E401; cần người dùng đăng nhập lúc phát hành.

## 2. Đóng gói và tài liệu cho người cài

- [x] Thêm LICENSE, metadata repository/bugs/homepage và README ngay trong package.
- [x] Giới hạn file tarball: ESM, declarations/maps và production source để tra cứu;
  loại test, mock, config và source của reference app.
- [x] Build sạch trước mỗi lần pack để không lấy output cũ.
- [x] Xem manifest thực tế của `npm pack`, kiểm tra các đích của exports tồn tại.

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
  consumer. Lần chạy thực tế trên GitHub sẽ được xác nhận sau khi push.
- [x] Changelog `0.1.0`, README hướng dẫn cài, giới hạn browser/ESM và compatibility.
- [x] Chạy đầy đủ kiểm tra local; kiểm tra nội dung tarball và metadata lần cuối.
  187 unit tests, 45 browser tests, lint/typecheck/build và hai tarball consumer qua.
- [x] Bỏ `private: true` ở package; root giữ nguyên private. Chỉ publish tarball đã
  qua kiểm thử, không publish từ root.

## 5. Phát hành và xác minh registry

- [ ] Người dùng đăng nhập npm bằng `npm login` và hoàn tất xác thực tài khoản.
  Không gửi token, mật khẩu hoặc mã OTP vào chat hay commit.
- [ ] Chốt version/dist-tag và tài khoản publish; kiểm tra tên lại ngay trước release.
- [x] `npm publish` dry-run với bản `0.1.0`, public access và dist-tag `latest` qua;
  không gửi bản phát hành lên registry.
- [ ] Đối chiếu `npm publish --dry-run` với artifact đã kiểm thử, rồi publish đúng
  tarball đó với public access. Ghi lại version, integrity và commit nguồn.
- [ ] Cài bản từ npm vào consumer sạch; xác nhận metadata, types, build và playback.
- [ ] Tag Git đúng version và cập nhật trạng thái phát hành sau khi registry xác nhận.

Các lần phát hành sau có thể dùng npm trusted publishing qua GitHub Actions.
Chưa cấu hình publish tự động khi tài khoản npm và quyền của repo chưa được chốt.

## Quy trình tái lập

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
`artifacts/react-strudel-kit-0.1.0.tgz`, kèm `package-validation.json` ghi integrity,
commit, trạng thái tracked files và phiên bản toolchain. Thư mục artifacts bị
Git ignore; CI upload artifact để tải về, không tự publish. Muốn tái lập đầy đủ,
chạy từ commit sạch; `AGENTS.md` chưa tracked của người dùng không được đưa vào tarball.

Sau khi kiểm tra đầy đủ và đã đăng nhập đúng npm account:

```sh
npm whoami --registry=https://registry.npmjs.org
npm view react-strudel-kit version --registry=https://registry.npmjs.org
npm publish ./artifacts/react-strudel-kit-0.1.0.tgz --access public --tag latest --dry-run --ignore-scripts
# Thực hiện khi sẵn sàng phát hành; version trên npm không thể ghi đè.
npm publish ./artifacts/react-strudel-kit-0.1.0.tgz --access public --tag latest --ignore-scripts
npm view react-strudel-kit@0.1.0 version dist.integrity --registry=https://registry.npmjs.org
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
