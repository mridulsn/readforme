# readforme

Paste any text and have it read aloud slowly, with each word lit up as it's spoken, in print as big as
you need. For tired eyes, long letters, and anyone who'd rather listen.

Live: https://mridulsaravanan.com/readforme/

- Reads sentence by sentence using the voices already on the device, Indian English first when there is one.
- **Back** and **Next** move one sentence; tap any sentence to start from there.
- Speed from very slow to fast, five text sizes, and a choice of voice. These are remembered on the device;
  the text is not.
- Paste, type, or open a .txt file.

`engine.js` splits text into sentences (handling Dr., Mr., e.g., 3.30, initials and the Hindi danda) and words,
and picks a voice. `index.html` is the page. Font: Pixelify Sans (SIL Open Font License, `assets/OFL-PixelifySans.txt`).

Testing: 25 engine checks, and 62 browser checks on desktop and phone. The browser tests swap in a fake speech
engine that fires word events, so highlighting, pause, back, next, tap-to-jump, speed and voice are checked exactly;
one more run uses the real speech engine.
