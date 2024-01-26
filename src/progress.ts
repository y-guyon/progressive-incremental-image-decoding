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

import "@material/mwc-fab";
import "@material/mwc-slider";
import { Fab } from "@material/mwc-fab";
import { Slider } from "@material/mwc-slider";

import { css, html, LitElement } from "lit";
import { customElement, query } from "lit/decorators.js";

import { EventType, dispatch, listen } from "./events";

/** Play button and progress bar component */
@customElement("data-progress-bar")
export class DataProgressBar extends LitElement {
  @query("mwc-fab") private readonly playButton!: Fab;
  @query("mwc-slider") private readonly slider!: Slider;
  @query("#numBytes") private readonly numBytes!: HTMLSpanElement;
  @query("#maxNumBytes") private readonly maxNumBytes!: HTMLSpanElement;

  private autoProgress = false;

  override connectedCallback() {
    super.connectedCallback();

    listen(EventType.SET_MAX_PROGRESS, (event) => {
      this.slider.max = Math.max(this.slider.max, event.detail.numBytes);
      this.maxNumBytes.textContent = String(event.detail.numBytes) + " bytes";
    });
    listen(EventType.SET_PROGRESS, (event) => {
      this.numBytes.textContent = String(event.detail.numBytes) + " bytes";
    });
  }

  override render() {
    const onClickButton = async () => {
      if (this.autoProgress) {
        this.autoProgress = false;
        this.playButton.icon = "play_arrow";
      } else {
        this.autoProgress = true;
        this.playButton.icon = "pause";

        if (this.slider.value === this.slider.max) {
          this.slider.value = 0;
          dispatch(EventType.SET_PROGRESS, { numBytes: 0 });
          await new Promise((f) => setTimeout(f, 100)); // 0.1 seconds per step
        }

        const STEPS = 30;
        while (this.autoProgress && this.slider.value < this.slider.max) {
          const numBytes = Math.min(
            Math.floor(this.slider.value + this.slider.max / STEPS),
            this.slider.max
          );
          this.slider.value = numBytes;
          dispatch(EventType.SET_PROGRESS, { numBytes: numBytes });
          await new Promise((f) => setTimeout(f, 100)); // 0.1 seconds per step
        }

        this.autoProgress = false;
        this.playButton.icon = "play_arrow";
      }
    };

    const onChangeSlider = () => {
      this.autoProgress = false;
      this.playButton.icon = "play_arrow";
      dispatch(EventType.SET_PROGRESS, { numBytes: this.slider.value });
    };

    const repoUrl =
      "https://github.com/y-guyon/progressive-incremental-image-decoding";

    // mwc-slider's @input immediately fires any change, whereas @change waits
    // for the user to release the handle.
    // mwc-slider's step could be set to 4 (see floorToValidBase64() comment)
    // but it fails with Uncaught TypeError: undefined 'width'.
    return html`<mwc-fab icon="play_arrow" @click=${onClickButton}></mwc-fab>
      <span id="numBytes">0 bytes</span>
      <mwc-slider
        value="0"
        min="0"
        max="65536"
        @input=${onChangeSlider}
      ></mwc-slider>
      <span id="maxNumBytes">unknown</span>
      <a href="${repoUrl}">
        <mwc-fab icon="info"></mwc-fab>
      </a>`;
  }

  static override styles = css`
    :host {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 20px;

      background-color: var(--mdc-theme-surface);
      border-radius: 16px;
      box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.2);
    }

    mwc-fab {
      --mdc-icon-size: 40px;
    }
    mwc-slider {
      width: 80%;
      flex: 1;
    }
    span {
      min-width: 200px;
      font-size: 20px;
      text-align: end;
      font-family: monospace;
    }
  `;
}
