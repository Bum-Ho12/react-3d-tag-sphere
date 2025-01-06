
# React 3D Tag Sphere

A React component for creating interactive 3D tag clouds with images and text. This component uses a canvas to render a visually appealing tag sphere that can be customized to fit various use cases such as skill showcases, image displays, and more.

## Installation

Install the package using npm or yarn:

```bash
npm install react-3d-tag-sphere
# or
yarn add react-3d-tag-sphere
```

## Features

- **3D Sphere Rendering**: Distributes tags evenly using a Fibonacci sphere algorithm.
- **Interactive Rotations**: Supports mouse movements for dynamic rotation.
- **Image-Based Tags**: Each tag can display an image with optional customization.
- **Smooth Animations**: Offers fluid animations and scaling for tags.

## Demo Video

Here is a demo of the project in action:

<video width="640" height="360" controls>
  <source src="https://raw.githubusercontent.com/Bum-Ho12/react-3d-tag-sphere/main/react-3d-tag-sphere.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>


## Usage

### Import and Setup

```tsx
import React from "react";
import { TagCloudCanvas } from 'react-3d-tag-sphere';

const MyComponent = () => {
  const skills = [
    { src: 'path/to/image1.svg', size: 30 },
    { src: 'path/to/image2.png', size: 40 },
    // Add more tags as needed
  ];

  return (
    <TagCloudCanvas
      tags={skills}
      height={300}
      width={300}
    />
  );
};

export default MyComponent;
```

### Props

| Prop   | Type     | Required | Description                                          |
|--------|----------|----------|------------------------------------------------------|
| `tags` | `Tag[]`  | Yes      | Array of tags to render. See the Tag interface below.|
| `height` | `number` | Yes      | Height of the canvas in pixels.                     |
| `width` | `number` | Yes      | Width of the canvas in pixels.                      |

#### Tag Interface

```ts
interface Tag {
  src: string;       // Image source URL
  size?: number;     // Size of the tag (default: 40)
  angle?: number;    // Initial angle for positioning
  phi?: number;      // Vertical angle (latitude)
  theta?: number;    // Horizontal angle (longitude)
  speed?: number;    // Speed of rotation (default: 1)
}
```

### Example Configuration

```tsx
const Example = () => {
  const tags = [
    { src: '/images/html.svg', size: 30 },
    { src: '/images/css.svg', size: 40 },
    { src: '/images/javascript.svg', size: 35 },
  ];

  return (
    <TagCloudCanvas
      tags={tags}
      height={500}
      width={500}
    />
  );
};

export default Example;
```

## How It Works

The component:
1. Distributes tags evenly across a spherical surface using the Fibonacci sphere algorithm.
2. Loads image resources asynchronously for rendering.
3. Animates tag rotation based on user interaction (mouse movement).
4. Scales tag size dynamically based on depth for a 3D effect.

## Styling and Customization

### Canvas Styling
The `TagCloudCanvas` component uses a canvas element for rendering. You can style the canvas via the `className` attribute or using CSS directly:

```css
canvas {
  background-color: transparent;
  cursor: move;
}
```

### Tag Size and Speed
Tags can be customized individually:

```tsx
const tags = [
  { src: '/images/html.svg', size: 50, speed: 2 },
  { src: '/images/css.svg', size: 40, speed: 1.5 },
];
```

## Development Notes

### Fibonacci Sphere Algorithm
The component uses the Fibonacci sphere algorithm to ensure even tag distribution on a spherical surface. Each tag's position is calculated based on its index in the array.

### Interactivity
The sphere rotates smoothly in response to mouse movement, and it defaults to auto-rotation when there is no interaction.

### Performance Optimization
To optimize rendering performance:
- Minimize the number of tags.
- Use appropriately sized images to reduce load time.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.

---

Happy coding with `react-3d-tag-sphere`! 🎉
