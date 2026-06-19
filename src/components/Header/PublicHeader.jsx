import React, { useState, useEffect, useMemo } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Link,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Fade,
  Slide,
  Stack,
} from "@mui/material";
import { Home, Menu as MenuIcon, Close, Groups, HowToRegOutlined } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import BrandLogoMark from "../common/BrandLogoMark";
import { BRAND as BRAND_SHARED } from "../../brand";

/** Elimu Plus — navy & gold derived from crest */
const BRAND = {
  ...BRAND_SHARED,
  surface: "rgba(240, 246, 252, 0.94)",
  surfaceBorder: "rgba(12, 35, 64, 0.2)",
};

export default function PublicHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [isAtTop, setIsAtTop] = useState(false); // Start with background, only transparent when explicitly at top
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero-section");
  const [isNavigating, setIsNavigating] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false); // Track if user has scrolled at least once
  const [isHeroVisible, setIsHeroVisible] = useState(false); // Track if hero section is visible

  const navItems = useMemo(
    () => [
      {
        label: "Home",
        icon: <Home />,
        sectionId: "hero-section",
        color: BRAND.gold,
      },
      {
        label: "About Us",
        icon: <Groups />,
        route: "/about-us",
        color: BRAND.gold,
      },
    ],
    []
  );

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setIsHeaderVisible(true);
  }, [location.pathname]);

  // Listen to hero section visibility events from HeroSection component
  useEffect(() => {
    if (location.pathname !== "/") {
      setIsHeroVisible(false);
      setIsAtTop(false);
      return;
    }

    const handleHeroVisibility = (event) => {
      const { isVisible, scrollY } = event.detail;
      setIsHeroVisible(isVisible);
      setIsAtTop(isVisible);

    };

    window.addEventListener("heroVisibilityChange", handleHeroVisibility);

    // Set initial state - check if we're at the top of the page
    const initialScrollY = window.scrollY;
    const isInitiallyAtTop = initialScrollY <= 20;
    
    // Check if hero section is visible in viewport
    const heroElement = document.getElementById("hero-section");
    let heroIsVisibleInViewport = false;
    if (heroElement) {
      const rect = heroElement.getBoundingClientRect();
      heroIsVisibleInViewport = rect.top < window.innerHeight && rect.bottom > 0;
    }

    // If at top and hero is visible, set transparent
    const shouldBeTransparent = isInitiallyAtTop && heroIsVisibleInViewport;
    setIsHeroVisible(shouldBeTransparent);
    setIsAtTop(shouldBeTransparent);

    return () => {
      window.removeEventListener("heroVisibilityChange", handleHeroVisibility);
    };
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const newScrolled = scrollY > 0;

      // Track if user has scrolled at least once
      if (scrollY > 0 && !hasScrolled) {
        setHasScrolled(true);
      }

      // Update scrolled state
      setScrolled(newScrolled);

      // Update isAtTop based on scroll position
      // On small screens, when scrolling back up, ensure header becomes transparent at top
      if (location.pathname === "/") {
        const isAtVeryTop = scrollY <= 20;
        const heroElement = document.getElementById("hero-section");
        let heroIsVisibleInViewport = false;
        if (heroElement) {
          const rect = heroElement.getBoundingClientRect();
          heroIsVisibleInViewport =
            rect.top < window.innerHeight && rect.bottom > 0;
        }
        const newIsAtTop = isAtVeryTop
          ? true
          : (isHeroVisible || heroIsVisibleInViewport) && scrollY <= 50;
        setIsAtTop(newIsAtTop);
      }

      // Don't update active section if we're currently navigating (clicked a nav item)
      if (isNavigating) return;

      // Detect active section based on scroll position
      if (location.pathname === "/") {
        // Hide header immediately when scrolling down from hero section
        const scrollY = window.scrollY;
        const isAtVeryTop = scrollY <= 20;
        
        // Hide header immediately when user starts scrolling down (any scroll > 20px)
        setIsHeaderVisible(isAtVeryTop);

        // Get all sections in the order they appear on the page (exclude items with routes)
        const sectionIds = navItems
          .filter((item) => !item.route && item.sectionId)
          .map((item) => item.sectionId);
        const sections = sectionIds
          .map((id) => {
            const element = document.getElementById(id);
            return element
              ? {
                  id,
                  top: element.offsetTop,
                  bottom: element.offsetTop + element.offsetHeight,
                }
              : null;
          })
          .filter((section) => section !== null)
          .sort((a, b) => a.top - b.top); // Sort by position on page

        const scrollPosition = window.scrollY + 200; // Offset for header height

        // If at top, set hero section as active
        if (window.scrollY < 100) {
          setActiveSection("hero-section");
          return;
        }

        // Find the section that's currently in view
        // Check from bottom to top to get the most recent section passed
        for (let i = sections.length - 1; i >= 0; i--) {
          const section = sections[i];
          if (scrollPosition >= section.top - 100) {
            // Add some threshold
            setActiveSection(section.id);
            break;
          }
        }
      } else if (
        location.pathname === "/about-us" ||
        location.pathname === "/meet-our-team"
      ) {
        const sy = window.scrollY;
        setIsHeaderVisible(sy <= 20);
      } else {
        setIsHeaderVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check on mount
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname, navItems, isNavigating, hasScrolled, isHeroVisible]);

  const isHomePage = location.pathname === "/";
  const isHeaderTransparent = isHomePage && isAtTop;
  const isActive = (path) => location.pathname === path;
  const onTransparentHeader = isHeaderTransparent;
  const headerActionColor =
    (isHeaderTransparent && isHeaderVisible) || (!scrolled && isHomePage)
      ? "white"
      : BRAND.navy;

  // Split nav items - on home page, show all on right when not in hero, otherwise all on right
  const leftNavItems = []; // No left nav items - all go to right
  const rightNavItems = navItems; // All nav items on the right

  const handleNavigateToSection = (item) => {
    setMobileMenuOpen(false);

    // If item has a route, navigate to that route
    if (item.route) {
      navigate(item.route);
      return;
    }

    // Otherwise, handle section scrolling
    const sectionId = item.sectionId;
    setActiveSection(sectionId);
    setIsNavigating(true);

    if (location.pathname === "/") {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
        // Ensure active section is set after scroll and re-enable scroll detection
        setTimeout(() => {
          setActiveSection(sectionId);
          setIsNavigating(false);
        }, 1000);
      } else {
        console.warn(`Section with id "${sectionId}" not found`);
        setIsNavigating(false);
      }
    } else {
      navigate("/");
      setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (section) {
          section.scrollIntoView({ behavior: "smooth", block: "start" });
          setTimeout(() => {
            setActiveSection(sectionId);
            setIsNavigating(false);
          }, 1000);
        } else {
          setIsNavigating(false);
        }
      }, 100);
    }
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor:
            (location.pathname === "/") && isAtTop
              ? "transparent"
              : BRAND.surface,
          backdropFilter:
            (location.pathname === "/") && isAtTop ? "none" : "blur(12px)",
          boxShadow:
            (location.pathname === "/") && isAtTop
              ? "none"
              : "0 8px 28px rgba(8, 22, 43, 0.12)",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          borderBottom:
            (location.pathname === "/") && isAtTop
              ? "none"
              : `1px solid ${BRAND.surfaceBorder}`,
          // Hide header when scrolling past hero section on home page, team page
          transform:
            (location.pathname === "/" ||
              location.pathname === "/about-us" ||
              location.pathname === "/meet-our-team") &&
            !isHeaderVisible
              ? "translateY(-100%)"
              : "translateY(0)",
          opacity:
            (location.pathname === "/" ||
              location.pathname === "/about-us" ||
              location.pathname === "/meet-our-team") &&
            !isHeaderVisible
              ? 0
              : 1,
          pointerEvents:
            (location.pathname === "/" ||
              location.pathname === "/about-us" ||
              location.pathname === "/meet-our-team") &&
            !isHeaderVisible
              ? "none"
              : "auto",
          // Hide active underline when any nav button is hovered
          "&:has(button:hover) button[data-active='true']::after": {
            opacity: 0,
          },
        }}
      >
        <Toolbar sx={{ px: { xs: 1, sm: 1.5, md: 2 }, py: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              minWidth: 0,
              gap: { md: 1, lg: 2 },
            }}
          >
            {/* Left — Elimu Plus wordmark */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flex: "0 1 auto",
                minWidth: 0,
                maxWidth: { xs: "52%", sm: "46%", md: "38%", lg: "34%" },
              }}
            >
              <Fade in={true} timeout={1000}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: { xs: 1, sm: 1.25 },
                    cursor: "pointer",
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    minWidth: 0,
                    width: "100%",
                    "&:hover": {
                      transform: "translateY(-1px)",
                    },
                  }}
                  onClick={() => navigate("/")}
                  aria-label="Elimu Plus home"
                >
                  <BrandLogoMark
                    size={52}
                    sx={{
                      height: { xs: 40, sm: 44, md: 48 },
                      maxWidth: { xs: "min(200px, 46vw)", sm: 220, md: 240 },
                      filter:
                        isHeaderTransparent && isHeaderVisible
                          ? "drop-shadow(0 2px 8px rgba(0,0,0,0.45))"
                          : "none",
                    }}
                  />
                </Box>
              </Fade>
            </Box>

            {/* Center Navigation Items - flex middle so never overlapped by logo */}
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                flex: "1 1 auto",
                minWidth: 0,
                gap: { md: 0.5, lg: 1 },
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {rightNavItems.map((item, index) => {
                const isActiveItem = item.route
                  ? location.pathname === item.route
                  : activeSection === item.sectionId &&
                    location.pathname === "/";
                const adjustedIndex = index;
                return (
                  <Slide
                    direction="down"
                    in={true}
                    timeout={800 + adjustedIndex * 200}
                    key={item.label}
                  >
                    <Button
                      onClick={() => handleNavigateToSection(item)}
                      startIcon={item.icon}
                      disableRipple
                      data-active={isActiveItem}
                        sx={{
                          color:
                            isActiveItem && location.pathname !== "/"
                              ? item.color
                              : (isHeaderTransparent && isHeaderVisible) || (!scrolled && (location.pathname === "/"))
                                ? "white"
                                : BRAND.navy,
                        fontSize: "clamp(0.7rem, 0.9vw + 0.5rem, 0.975rem)",
                        fontWeight:
                          isActiveItem && location.pathname !== "/" ? 700 : 600,
                        px: { md: 1, lg: 1.5, xl: 2 },
                        py: { md: 0.9, lg: 1, xl: 1.2 },
                        borderRadius: "25px",
                        textTransform: "uppercase",
                        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        position: "relative",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        backgroundColor:
                          isActiveItem && location.pathname !== "/"
                            ? scrolled || location.pathname !== "/"
                              ? `${item.color}20`
                              : `${item.color}30`
                            : "transparent",
                        "&:focus": {
                          outline: "none",
                          backgroundColor:
                            isActiveItem && location.pathname !== "/"
                              ? scrolled || location.pathname !== "/"
                                ? `${item.color}20`
                                : `${item.color}30`
                              : "transparent",
                        },
                        "&:focus-visible": {
                          outline: "none",
                        },
                        "& .MuiButton-startIcon": {
                          marginRight: { md: 0.5, lg: 0.75, xl: 1 },
                          "& > *:nth-of-type(1)": {
                            fontSize: "clamp(0.9rem, 1vw, 1.1rem)",
                            color:
                              isActiveItem && location.pathname !== "/"
                                ? item.color
                                : "inherit",
                          },
                        },
                        "&:hover": {
                          backgroundColor: "transparent",
                          transform: "none",
                          boxShadow: "none",
                          "& .icon": {
                            color: item.color,
                          },
                        },
                        "&:hover::after": {
                          content: '""',
                          position: "absolute",
                          bottom: 0,
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: "60%",
                          height: "3px",
                          backgroundColor:
                            location.pathname === "/" ? "white" : item.color,
                          borderRadius: "2px 2px 0 0",
                          transition: "all 0.3s ease-out",
                          zIndex: 1,
                        },
                        "&::after":
                          isActiveItem && location.pathname === "/"
                            ? {
                                content: '""',
                                position: "absolute",
                                bottom: 0,
                                left: "50%",
                                transform: "translateX(-50%)",
                                width: "60%",
                                height: "3px",
                                backgroundColor: "white",
                                borderRadius: "2px 2px 0 0",
                                transition: "opacity 0.3s ease-out",
                                opacity: 1,
                              }
                            : isActiveItem && location.pathname !== "/"
                              ? {
                                  content: '""',
                                  position: "absolute",
                                  bottom: 0,
                                  left: "50%",
                                  transform: "translateX(-50%)",
                                  width: "60%",
                                  height: "3px",
                                  backgroundColor: item.color,
                                  borderRadius: "2px 2px 0 0",
                                }
                              : {},
                        "& .icon": {
                          transition: "all 0.4s ease",
                          color:
                            isActiveItem && location.pathname !== "/"
                              ? item.color
                              : (isHeaderTransparent && isHeaderVisible) || (!scrolled && location.pathname === "/")
                                ? "white"
                                : item.color,
                        },
                      }}
                    >
                      {item.label}
                    </Button>
                  </Slide>
                );
              })}
            </Box>

            {/* Apply admission + Login — far right */}
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                flex: "0 0 auto",
                justifyContent: "flex-end",
                gap: 1,
              }}
            >
              <Button
                variant="outlined"
                startIcon={<HowToRegOutlined sx={{ fontSize: "1.1rem !important" }} />}
                onClick={() => navigate("/admission/apply")}
                sx={{
                  px: 2,
                  py: 1.05,
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  borderRadius: 2,
                  color: headerActionColor,
                  borderColor: onTransparentHeader ? "rgba(255,255,255,0.55)" : BRAND.surfaceBorder,
                  textTransform: "none",
                  whiteSpace: "nowrap",
                  transition: "all 0.3s ease",
                  backgroundColor: location.pathname.startsWith("/admission")
                    ? onTransparentHeader
                      ? "rgba(255,255,255,0.12)"
                      : "rgba(12, 35, 64, 0.06)"
                    : "transparent",
                  "&:focus": { outline: "none" },
                  "&:focus-visible": { outline: "none" },
                  "&:hover": {
                    borderColor: onTransparentHeader ? "#fff" : BRAND.gold,
                    color: onTransparentHeader ? "#fff" : BRAND.navyDeep,
                    backgroundColor: onTransparentHeader
                      ? "rgba(255,255,255,0.14)"
                      : "rgba(201, 162, 39, 0.12)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                Apply admission
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate("/login")}
                sx={{
                  px: 2.75,
                  py: 1.15,
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  borderRadius: 2,
                  background: `linear-gradient(145deg, ${BRAND.goldMuted}, ${BRAND.gold})`,
                  color: BRAND.navyDeep,
                  textTransform: "none",
                  border: `1px solid rgba(255,255,255,0.35)`,
                  boxShadow: "0 4px 14px rgba(12, 35, 64, 0.22)",
                  transition: "all 0.3s ease",
                  "&:focus": {
                    outline: "none",
                    boxShadow: "0 4px 14px rgba(12, 35, 64, 0.22)",
                  },
                  "&:focus-visible": {
                    outline: "none",
                  },
                  "&:hover": {
                    background: BRAND.goldMuted,
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 18px rgba(12, 35, 64, 0.28)",
                  },
                }}
              >
                Login
              </Button>
            </Box>

            {/* Enhanced Mobile Menu Button */}
            <Fade in={true} timeout={1200}>
              <IconButton
                disableRipple
                sx={{
                  display: { xs: "flex", md: "none" },
                  marginLeft: "auto",
                  color: mobileMenuOpen
                    ? BRAND.navy
                    : (isHeaderTransparent && isHeaderVisible) || (!scrolled && (location.pathname === "/"))
                      ? "white"
                      : BRAND.navy,
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  borderRadius: "12px",
                  backgroundColor: mobileMenuOpen
                    ? scrolled || location.pathname !== "/"
                      ? "rgba(12, 35, 64, 0.08)"
                      : "rgba(12, 35, 64, 0.12)"
                    : "transparent",
                  "&:focus": {
                    outline: "none",
                    backgroundColor: mobileMenuOpen
                      ? scrolled || location.pathname !== "/"
                        ? "rgba(12, 35, 64, 0.08)"
                        : "rgba(12, 35, 64, 0.12)"
                      : "transparent",
                  },
                  "&:focus-visible": {
                    outline: "none",
                    boxShadow: "none",
                  },
                  "&:hover": {
                    backgroundColor: mobileMenuOpen
                      ? scrolled || location.pathname !== "/"
                        ? "rgba(12, 35, 64, 0.12)"
                        : "rgba(12, 35, 64, 0.18)"
                      : scrolled || location.pathname !== "/"
                        ? "rgba(12, 35, 64, 0.06)"
                        : "rgba(255, 255, 255, 0.15)",
                    transform: mobileMenuOpen
                      ? "scale(1.05)"
                      : "rotate(90deg) scale(1.1)",
                    boxShadow:
                      scrolled || location.pathname !== "/"
                        ? "0 8px 25px rgba(12, 35, 64, 0.12)"
                        : "0 8px 25px rgba(255, 255, 255, 0.2)",
                  },
                }}
                onClick={() => setMobileMenuOpen(true)}
              >
                <MenuIcon sx={{ fontSize: "1.8rem" }} />
              </IconButton>
            </Fade>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Compact Mobile Dropdown */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "260px", sm: "300px" },
            marginRight: { xs: 2, sm: 3 },
            backgroundColor: "#f5f8fc",
            backgroundImage:
              "linear-gradient(135deg, rgba(240, 246, 252, 0.98) 0%, rgba(255, 255, 255, 0.98) 100%)",
            backdropFilter: "blur(20px)",
            borderLeft: `1px solid ${BRAND.surfaceBorder}`,
            boxShadow: "0 8px 32px rgba(26, 26, 26, 0.12)",
            height: "auto", // shrink to content by default
            maxHeight: {
              xs: "calc(100vh - 72px)",
              sm: "calc(100vh - 80px)",
            }, // cap height on small screens
            top: { xs: "64px", sm: "72px" },
            overflowY: "auto", // always allow scroll if items overflow
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                background: `linear-gradient(45deg, ${BRAND.navy}, ${BRAND.gold})`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: { xs: "1.1rem", sm: "1.25rem" },
              }}
            >
              Menu
            </Typography>
            <IconButton
              onClick={() => setMobileMenuOpen(false)}
              size="small"
              sx={{
                transition: "all 0.3s ease",
                borderRadius: "8px",
                "&:focus": { outline: "none" },
                "&:focus-visible": { outline: "none", boxShadow: "none" },
                "&:hover": {
                  transform: "rotate(90deg)",
                  backgroundColor: "rgba(12, 35, 64, 0.06)",
                },
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 1.5, borderColor: BRAND.surfaceBorder }} />
          <List
            dense
            sx={{ py: 0, gap: 0.5, display: "flex", flexDirection: "column" }}
          >
            {navItems.map((item, index) => {
              const isActiveItem = item.route
                ? location.pathname === item.route
                : activeSection === item.sectionId && location.pathname === "/";
              return (
                <ListItem
                  dense
                  key={item.label}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleNavigateToSection(item);
                  }}
                  disableRipple
                  sx={{
                    cursor: "pointer",
                    borderRadius: "12px",
                    py: 1,
                    px: 1.5,
                    transition: "all 0.3s ease",
                    backgroundColor: isActiveItem
                      ? `${item.color}20`
                      : "transparent",
                    borderLeft: isActiveItem
                      ? `3px solid ${item.color}`
                      : "3px solid transparent",
                    "&:focus": {
                      outline: "none",
                      backgroundColor: isActiveItem
                        ? `${item.color}20`
                        : "transparent",
                    },
                    "&:focus-visible": {
                      outline: "none",
                    },
                    "&:hover": {
                      backgroundColor: `${item.color}15`,
                      transform: "translateX(8px)",
                      boxShadow: `0 4px 12px ${item.color}20`,
                      "& .icon": {
                        color: item.color,
                        transform: "rotate(180deg)",
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActiveItem ? item.color : item.color,
                      minWidth: 32,
                      "& .icon": {
                        transition: "all 0.3s ease",
                      },
                    }}
                  >
                    {React.cloneElement(item.icon, {
                      className: "icon",
                      fontSize: "small",
                    })}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: { xs: "0.9rem", sm: "1rem" },
                      fontWeight: isActiveItem ? 700 : 600,
                      color: isActiveItem ? item.color : BRAND.navy,
                    }}
                  />
                </ListItem>
              );
            })}
          </List>
          <Divider sx={{ my: 1.5, borderColor: BRAND.surfaceBorder }} />
          <Stack spacing={1}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<HowToRegOutlined />}
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/admission/apply");
              }}
              sx={{
                px: 3,
                py: 1.35,
                fontSize: "0.875rem",
                fontWeight: 700,
                borderRadius: 2,
                color: BRAND.navy,
                borderColor: BRAND.surfaceBorder,
                textTransform: "none",
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: BRAND.gold,
                  backgroundColor: "rgba(201, 162, 39, 0.1)",
                },
              }}
            >
              Apply admission
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/login");
              }}
              sx={{
                px: 3,
                py: 1.5,
                fontSize: "0.875rem",
                fontWeight: 700,
                borderRadius: 2,
                background: `linear-gradient(145deg, ${BRAND.goldMuted}, ${BRAND.gold})`,
                color: BRAND.navyDeep,
                textTransform: "none",
                border: `1px solid rgba(255,255,255,0.35)`,
                boxShadow: "0 4px 14px rgba(12, 35, 64, 0.2)",
                transition: "all 0.3s ease",
                "&:focus": {
                  outline: "none",
                  boxShadow: "0 4px 14px rgba(12, 35, 64, 0.2)",
                },
                "&:focus-visible": {
                  outline: "none",
                },
                "&:hover": {
                  background: BRAND.goldMuted,
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 18px rgba(12, 35, 64, 0.26)",
                },
              }}
            >
              Login
            </Button>
          </Stack>
        </Box>
      </Drawer>

      <Toolbar
        sx={{
          height: scrolled || location.pathname !== "/" ? "72px" : "80px",
          transition: "height 0.4s ease",
        }}
      />

    </>
  );
}
