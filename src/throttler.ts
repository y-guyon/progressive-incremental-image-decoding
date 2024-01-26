// Copyright 2024 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { css, html, LitElement } from "lit";
import { customElement, query, property } from "lit/decorators.js";

import { EventType, dispatch, listen } from "./events";

/** Image compoenent that can limit the file size */
@customElement("image-throttler")
export class ImageThrottler extends LitElement {
  @property({ attribute: false }) imageUrl!: string;
  @property({ attribute: false }) description!: string;

  @query("img") private readonly image!: HTMLImageElement;

  private arrayBuffer: ArrayBuffer | null = null;
  private width = 0;
  private height = 0;
  private numBytes = 0;

  override connectedCallback() {
    super.connectedCallback();

    listen(EventType.SET_PROGRESS, (event) => {
      if (this.arrayBuffer === null) return;
      const numBytes = Math.min(
        event.detail.numBytes,
        this.arrayBuffer.byteLength
      );
      if (this.numBytes !== numBytes) {
        this.numBytes = numBytes;

        this.image.src =
          "data:image/whatever;base64," +
          arrayBufferToBase64(this.arrayBuffer, this.numBytes);

        // Uncommenting the following would make the 0-byte broken images keep
        // the same dimensions but they no longer keep their ratio when the
        // window canvas cannot hold all of them at full resolution.
        //  this.image.width = this.width;
        //  this.image.height = this.height;
      }
    });
  }

  private async initialize() {
    this.width = this.image.width;
    this.height = this.image.height;
    if (this.width === 0 || this.height === 0) return;

    const arrayBuffer = await imageUrlToArrayBuffer(this.imageUrl);
    if (arrayBuffer instanceof ArrayBuffer) {
      this.arrayBuffer = arrayBuffer;
      dispatch(EventType.SET_MAX_PROGRESS, {
        numBytes: this.arrayBuffer.byteLength,
      });
    }
  }

  override render() {
    return html`<img
        src="${this.imageUrl}"
        @load="${() => {
          this.initialize();
        }}"
      />
      <p>${this.description}</p>`;
  }

  static override styles = css`
    :host {
      width: 756px;
      max-width: 31%; /* Three images; always fit in viewport. */
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    img {
      background-color: #808080; /* fallback in case of image loading failure */
      background-image: url("/transparency_checkerboard.webp");
      max-width: 100%;
    }
    button,
    img {
      box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.4);
    }
    p {
      text-align: center;
      margin: 0;
    }
  `;
}

async function imageUrlToArrayBuffer(url: string) {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((onSuccess, onError) => {
    try {
      const reader = new FileReader();
      reader.onload = function () {
        onSuccess(this.result);
      };
      reader.readAsArrayBuffer(blob);
    } catch (e) {
      onError(e);
    }
  });
}

function arrayBufferToBase64(arrayBuffer: ArrayBuffer, maxNumBytes: number) {
  let binary = "";
  const bytes = new Uint8Array(arrayBuffer);
  const length = Math.min(bytes.byteLength, maxNumBytes);
  for (let i = 0; i < length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);  // Replace with buffer.toString('base64')?
}
