// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod app_lib {
    use tauri::Manager;
    
    pub fn run() {
        tauri::Builder::default()
            .setup(|app| {
                println!("Setting up app...");
                
                // Create splash screen window programmatically
                let splashscreen = tauri::WebviewWindowBuilder::new(
                    app,
                    "splashscreen",
                    tauri::WebviewUrl::App("/splashscreen.html".into())
                )
                .title("Splash")
                .decorations(false)
                .center()
                .focused(true)
                .always_on_top(true)
                .inner_size(1200.0, 800.0)
                .build()?;
                
                let main_window = app.get_webview_window("main").unwrap();
                
                println!("Got windows: splashscreen={:?}, main={:?}", 
                        splashscreen.label(), main_window.label());
                
                tauri::async_runtime::spawn(async move {
                    println!("Initializing...");
                    std::thread::sleep(std::time::Duration::from_secs(2));
                    println!("Done initializing.");
                    
                    match splashscreen.close() {
                        Ok(_) => println!("Splash screen closed successfully"),
                        Err(e) => println!("Error closing splash: {:?}", e),
                    };
                    
                    main_window.show().unwrap();
                });
                Ok(())
            })
            .run(tauri::generate_context!())
            .expect("failed to run app");
    }
}

fn main() {
    app_lib::run();
}
