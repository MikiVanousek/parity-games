// a throttle funtion that will only call the function once every 100ms
export default function throttleUpdate(fn: any) {
  let last = Date.now();
  return function () {
    if (Date.now() - last >= 100) {
      fn.apply(this, arguments);
      last = Date.now();
    }
  };
}
