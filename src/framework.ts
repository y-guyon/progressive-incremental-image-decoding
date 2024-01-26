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

import "./progress";
import "./throttler";

import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

/** Progressive and incremental image decoding demo component */
@customElement("progressive-incremental-framework")
export class Framework extends LitElement {
  override render() {
    const renderImages = () => {
      const images = [
        ["/rainbow.png", "PNG - 699144 bytes"],
        ["/rainbow.jpg", "JPG quality 100 - 460047 bytes"],
        [
          "/rainbow_progressive.jpg",
          "JPG quality 100 progressive - 426041 bytes",
        ],
      ];
      return images.map((image) => {
        return html`<image-throttler
          .imageUrl="${image[0]}"
          .description="${image[1]}"
        ></image-throttler>`;
      });
    };

    return html`<data-progress-bar></data-progress-bar>
      <div id="images">${renderImages()}</div>`;
  }

  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 20px;
      overflow: hidden;
    }

    #images {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      justify-content: space-evenly;
      gap: 20px;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "progressive-incremental-framework": Framework;
  }
}
