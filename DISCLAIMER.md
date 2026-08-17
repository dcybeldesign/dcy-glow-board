# Disclaimer

*[Version française](DISCLAIMER.fr.md)*

This project is an independent, personal hobby dashboard for [Home Assistant](https://www.home-assistant.io/). It is **not affiliated with, endorsed by, or supported by** Home Assistant, Nabu Casa, or the Open Home Foundation.

## No warranty

This software is provided "as is", without warranty of any kind, express or implied. See the [MIT License](LICENSE) for the full legal text. In particular, there is no guarantee that it will work correctly with your specific Home Assistant setup, integrations, or devices.

## Use at your own risk

This dashboard can control real physical devices (locks, alarm systems, climate control, covers, vacuums, and more) through Home Assistant's service calls. By using it, you accept full responsibility for:

- Any unintended action triggered on a connected device (a light left on, a lock left unlocked, a false alarm disarm, etc.).
- Any consequence of exposing your Home Assistant instance to a network (local, VPN, or otherwise) to make this dashboard reachable.
- Any consequence of how you generate, store, or share your Home Assistant long-lived access token. The token is stored only in your browser's `localStorage` and is never sent anywhere other than your own Home Assistant instance. That said, a token in `localStorage` is as sensitive as a password: anyone with access to that browser profile, or to the device it's on, can use it to control your home. Treat the URL you use to reach this dashboard, and the device it's open on, accordingly.

The author is not liable for any damage, loss, security incident, or malfunction resulting from the use, misuse, or inability to use this software.

## Credit

This project is free to use, share, and modify under the MIT License (see above). If you reuse or build on this work, a credit back to the original author is appreciated, though not legally required beyond the copyright notice the license already asks you to keep.

## Testing status

Not every card style in this project has been verified against real hardware: some have only been checked in the built-in developer preview (simulated entities, no real device involved). See the README's "What's tested" section for the current status per feature. Treat anything marked "dev-preview only" as unverified in real-world conditions.

## Third-party content

This repository bundles or references third-party assets (icons, design inspiration) that are not the author's own work. See the "Credits" section of the [README](README.md) for attribution and licensing details.
