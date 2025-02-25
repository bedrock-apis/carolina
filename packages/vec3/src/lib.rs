#![deny(clippy::all)]

#[macro_use]
extern crate napi_derive;

use napi::{JsArrayBuffer};

#[napi]
pub fn get_number(buffer: JsArrayBuffer, index: u32) -> u8{
  let a = buffer.into_ref().unwrap();
  let u = a.as_ref();
  u[index as usize]
}