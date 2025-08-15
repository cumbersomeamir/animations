# ChatGPT AGI Animation

A smooth, modern p5.js animation with an explainer-video feel that displays the text "ChatGPT is already close to AGI" with beautiful animations.

## Features

- **Smooth Gradient Background**: Subtly shifting pastel colors that create a modern, clean aesthetic
- **Sequential Text Animation**: Each word appears one-by-one with scaling and fade-in effects
- **Floating Animation**: Once all words are visible, they gently float up and down in a looping motion
- **High Performance**: Runs at 60fps with smooth easing and seamless looping
- **Responsive Design**: Automatically adjusts to different screen sizes
- **Clean Typography**: Bold, sans-serif font with high legibility

## How to Run

1. Simply open `index.html` in any modern web browser
2. The animation will start automatically
3. No additional setup or dependencies required

## Animation Phases

1. **Typing Phase**: Words appear sequentially with scale and opacity animations
2. **Floating Phase**: All words gently float up and down with different speeds for visual variety

## Customization

You can easily modify the animation by editing the following parameters in the code:

- **Text**: Change the message in the `setup()` function
- **Colors**: Modify the `gradientHue` and HSL values for different color schemes
- **Timing**: Adjust animation delays and speeds
- **Font**: Change the font family and size in the `Word.draw()` method
- **Float Range**: Modify the `15` value in the floating animation for different movement ranges

## Technical Details

- Built with p5.js 1.7.0
- Uses CSS3 for smooth animations and transitions
- Responsive canvas that adapts to window resizing
- Optimized for 60fps performance
- Clean, modular code structure with ES6 classes

## Browser Compatibility

Works in all modern browsers that support:
- HTML5 Canvas
- ES6 JavaScript features
- CSS3 animations

Enjoy the smooth, modern animation experience!
# animations
