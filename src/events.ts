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
// WITHOUT WARRANTIES OR CONDITIONS OF ANY TEventIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/** A list of all the events that can be triggered by the client. */
export enum EventType {
  // Fired when an image file size is known (possibly multiple times).
  SET_MAX_PROGRESS = "SET_MAX_PROGRESS",
  // The user manually set the decoding progress to a number of bytes or it was
  // automatically incremented.
  SET_PROGRESS = "SET_PROGRESS",
}

/**
 * Associate the custom event types above to the data structures below globally.
 * This allows typescript to deduce the CustomEvent specialization depending on
 * the event type, at dispatch and listen calls.
 */
declare global {
  interface WindowEventMap {
    SET_MAX_PROGRESS: CustomEvent<Progress>;
    SET_PROGRESS: CustomEvent<Progress>;
  }
}

// Structured custom event data

interface Progress {
  numBytes: number;
}

// Helper functions

type EventDataTypeFromCustomEventType<C> = C extends CustomEvent<infer T>
  ? T
  : never;

/**
 * Instantiates an Event and dispatches it.
 * If data is provided, instantiates a typed CustomEvent instead, assigns its
 * data as CustomEvent.detail and dispatches it.
 */
export function dispatch<TEvent extends keyof WindowEventMap>(
  eventType: TEvent,
  data?: EventDataTypeFromCustomEventType<WindowEventMap[TEvent]>
) {
  if (data === undefined) {
    window.dispatchEvent(new Event(eventType));
  } else {
    window.dispatchEvent(
      new CustomEvent<EventDataTypeFromCustomEventType<WindowEventMap[TEvent]>>(
        eventType,
        {
          detail: data,
        }
      )
    );
  }
}

/**
 * Same as window.addEventListener(). Available for consistency with
 * Dispatch(). To be called in connectedCallback() of LitElements.
 * Call window.removeEventListener() before removing the listener object from
 * the DOM.
 */
export function listen<TEvent extends keyof WindowEventMap>(
  eventType: TEvent,
  listener: (this: Window, ev: WindowEventMap[TEvent]) => void,
  options?: boolean | AddEventListenerOptions
) {
  window.addEventListener(eventType, listener, options);
}
