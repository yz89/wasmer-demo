#[link(wasm_import_module = "env")]
extern "C" {
    fn print_str(ptr: *const u8, len: usize);
}

static HELLO: &'static str = "Hello World!";


#[no_mangle]
pub extern "C" fn execute() {
    unsafe {
        print_str(HELLO.as_ptr(), HELLO.len());
    }
}

#[no_mangle]
pub extern "C" fn add(x:i64, y:i64) -> i64 {
    unsafe {
        x+y
    }
}


