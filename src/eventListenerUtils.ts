/**
 * This function can be used to add event listener to the target and remove it after the first time it is triggered
 * @param target The target of the event listener
 * @param type The type of the event listener
 * @param callback The callback function which is invoked when the event is triggered
 * @param options The options of the event listener
 */
export function addEventListenerOnce(
  target: EventTarget,
  type: string,
  callback: EventListener,
  options?: boolean | AddEventListenerOptions,
) {
  const handler = (event: Event) => {
    target.removeEventListener(type, handler, options)
    callback(event)
  }
  target.addEventListener(type, handler, options)
}
