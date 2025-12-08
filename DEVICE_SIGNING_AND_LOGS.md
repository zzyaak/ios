# Running the app on a physical device

The device crash logs show `FBSOpenApplicationServiceErrorDomain` with reason `Security` (invalid code signature/not trusted profile). That means the app bundle must be signed with a provisioning profile the device trusts. Use the steps below before launching to avoid the black screen/failed launch and to capture the logs this project emits (via `AppLogger`).

## Fix code signing (iOS device)
1. Open **Proskomidiya.xcodeproj** in Xcode.
2. Select the **Proskomidiya** target → **Signing & Capabilities**.
3. Set **Team** to your Apple ID team (Personal Team works for local devices). Xcode will generate a valid provisioning profile.
4. If you changed the bundle identifier, keep the same value in the target and `Info.plist`.
5. Build & run again. If iOS says the developer is not trusted:
   - On the device, go to **Settings → General → VPN & Device Management** (or **Profiles & Device Management**), trust your developer certificate, then relaunch.
6. On iOS 16+, ensure **Developer Mode** is enabled on the device (Settings → Privacy & Security → Developer Mode).

## See logs in the terminal
- While the app is running, the logger writes through `print` and the unified logging system. Connect the device and run:
  - `log stream --predicate 'subsystem == "com.proskomidiya.app"'` to see `AppLogger` output.
  - Or use **Xcode → Devices & Simulators → Open Console** on the connected device.
- If the app fails to launch, the system log will still contain the signing error from `log stream` or the device console.

Following these steps should unblock installs on a physical device and make the existing in-app logs visible in your terminal.
