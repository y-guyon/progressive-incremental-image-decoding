# Progressive and incremental image decoding demo

This experimental framework showcases a few Web image formats and their various
decoding modes when data is partially received:

https://y-guyon.github.io/progressive-incremental-image-decoding

The intent is to have the same visual result as Chrome DevTools' throttling
feature but per image rather than on the whole page, for convenience of replay
and manual slider cursor positioning.

## Context

Traditional image decoding can be performed as:

- One-shot: The image is decoded in one-go. All pixels are available at the same
  time once all sample bytes are decoded.
- Incremental (also called scanline-order): Every time a group of pixel rows
  have been fully decoded, the destination buffer is rendered to the screen. The
  missing pixels are usually replaced with fully transparent pixels or by a
  uniform color (for example white or black or the color used as background).
  Depending on the image format, the samples may be coded in tiles rather than
  in full-width rows. Thus pixels can appear in rectangles rather than
  row-by-row.
- Progressive: The image is first rendered in its lowest resolution or quality,
  then refined to look better and better until the final visual quality is
  displayed. This leverages the fact that the coding of the samples in the same
  spatial area is spread in the encoded image rather than being grouped in a
  single chunk of bytes. This particular spatial area gets a visual quality
  improvement every time related coded bytes are decoded. These passes can
  either refresh the whole image canvas in one go, or themselves be incremental.
  The visual quality improvement can come from increased pixel resolution or
  density, meaning more pixels are decoded in the same image region, and/or from
  higher frequencies of a same sample being decoded, meaning the same pixel has
  its components getting closer and closer to their final values.

## Supported formats

- PNG scanline decoding works. It has a higher granularity than throttling using
  Chrome DevTools.
- Progressive JPEG decoding works.
- JPEG scanline decoding flickers.
- WebP incremental decoding does not work at all.
- Tiled AVIF incremental decoding does not work at all.

Results in Firefox are similar (both browsers are based on Skia).

## Technology

Image payloads are retrieved using a
[`FileReader`](https://developer.mozilla.org/en-US/docs/Web/API/FileReader). A
portion of the data is copied to a
[`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)
which is then converted to a
[base64](https://developer.mozilla.org/en-US/docs/Glossary/Base64) string, set
as the `src` property of an
[`<img>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img) element
to simulate a partially received image.

Unfortunately Chrome/Skia does not handle both the same way.

## Build instructions

Install `npm`: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm

```sh
git clone https://github.com/y-guyon/progressive-incremental-image-decoding.git
cd progressive-incremental-image-decoding
npm install
npm run dev
```

## Contributions

See [CONTRIBUTING.md](CONTRIBUTING.md).

Feel free to suggest fixes or alternatives. One would be using WASM interfaces
to directly call codec API decoding functions and display the result to a
canvas, but this does not behave as if Chrome was waiting for the file to arrive
either.

Maintaining a back-end infrastructure to send throttled image payloads is not
the goal of this experiment. A small implementation for this already exists in
[libwebp2](https://chromium.googlesource.com/codecs/libwebp2/+/27488d8805e7f620ca78c7dbd8077855e0835f5c/tests/tools/stuttering_http_server.py).

## License

See the [Apache v2.0 license](LICENSE) file.
