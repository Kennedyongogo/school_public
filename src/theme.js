import { createTheme } from "@mui/material/styles";

// Elegant Earth Tones Color Palette from Mood Board
const earthTones = {
  // Beige tones
  beige: {
    light: "#F5F1E8", // Light beige background
    main: "#E8E0D1", // Main beige
    dark: "#D4C9B5", // Darker beige
  },
  // Brown tones
  brown: {
    dark: "#3D2817", // Dark brown for text/titles
    main: "#6B4E3D", // Medium brown for logo/primary
    light: "#8B6F5E", // Lighter brown for secondary text
  },
  // Green tones
  green: {
    olive: "#6B7D47", // Olive green
    forest: "#2D4A2D", // Dark forest green
    light: "#8B9A6B", // Light olive
  },
  // Orange/Rust tones
  orange: {
    rust: "#B85C38", // Burnt orange/rust
    light: "#C97A5A", // Light rust
    dark: "#8B4225", // Dark rust
  },
};

const theme = createTheme({
  palette: {
    primary: {
      main: earthTones.brown.main, // Medium brown as primary
      light: earthTones.brown.light,
      dark: earthTones.brown.dark,
    },
    secondary: {
      main: earthTones.orange.rust, // Burnt orange as secondary
      light: earthTones.orange.light,
      dark: earthTones.orange.dark,
    },
    info: {
      main: earthTones.green.olive, // Olive green
      light: earthTones.green.light,
      dark: earthTones.green.forest,
    },
    background: {
      default: earthTones.beige.light, // Light beige background
      paper: "#FFFFFF",
      dark: earthTones.brown.dark,
    },
    text: {
      primary: earthTones.brown.dark, // Dark brown for text
      secondary: earthTones.brown.light, // Lighter brown for secondary text
    },
    success: {
      main: earthTones.green.forest, // Dark forest green for success
      light: earthTones.green.olive,
      dark: "#1E331E",
    },
    // Custom earth tone colors for direct use
    earthTones: earthTones,
  },
  typography: {
    fontFamily: '"Cormorant Garamond", "Open Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
      color: earthTones.brown.dark,
    },
    h2: {
      color: earthTones.brown.dark,
    },
    h3: {
      color: earthTones.brown.dark,
    },
    h4: {
      color: earthTones.brown.dark,
    },
    h5: {
      color: earthTones.brown.dark,
    },
    h6: {
      color: earthTones.brown.dark,
    },
    button: {
      textTransform: "none",
    },
  },
});

export { theme };
