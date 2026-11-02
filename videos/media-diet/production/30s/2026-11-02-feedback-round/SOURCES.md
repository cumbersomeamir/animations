# Facts file — claim → source → quoted wording (feedback-round episode, accessed 2026-11-02)

## Sources
| id | source | date | quoted wording (verbatim) |
|---|---|---|---|
| S1 | GPS.gov (U.S. government), *GPS Accuracy*, archived page https://archive.gps.gov/systems/gps/performance/accuracy/ | page note: not updated since Feb 2025 | "Many things can degrade GPS positioning accuracy. Common causes include: Satellite signal blockage due to buildings, bridges, trees, etc. Indoor or underground use. Signals reflected off buildings or walls ("multipath")." |
| S2 | NOAA National Geodetic Survey, *What is LIDAR?*, https://geodesy.noaa.gov/INFO/facts/lidar.shtml | accessed 2026-11-02 | "LIDAR—Light Detection and Ranging—is a remote sensing method … that uses light in the form of a pulsed laser to measure ranges (variable distances)…" · "the beam of light is reflected by the surface it encounters. A sensor records this reflected light to measure a range." |
| S3 | USGS Open-File Report 2025-1017, *Validation of the Geometric Accuracy of Airborne Light Detection and Ranging Data for Eastern Iowa, 2019*, https://pubs.usgs.gov/publication/ofr20251017/full | 2025 | "The lidar systematically emits laser pulses and records the return time and intensity of the reflected light, capturing millions of data points." |
| S4 | H. Durrant-Whyte & T. Bailey, *Simultaneous Localisation and Mapping (SLAM): Part I The Essential Algorithms*, IEEE Robotics & Automation Magazine 13(2), 2006, doi:10.1109/MRA.2006.1638022 (PDF via University of Wisconsin course page https://pages.cs.wisc.edu/~jphanna/teaching/25spring_cs639/resources/SLAM-tutorial-I.pdf) | 2006 | "The Simultaneous Localisation and Mapping (SLAM) problem asks if it is possible for a mobile robot to be placed at an unknown location in an unknown environment and for the robot to incrementally build a consistent map of this environment while simultaneously determining its location within this map." |
| S5 | Mobile Industrial Robots A/S, *MiR250 Technical Guide (en)* 07/2020 v.1.0 (manufacturer manual; copy hosted by distributor ASTOR) | 2020 | "When the robot is mapping, the map is created using both the scanner and odometry data" · "The robot computer compares the input from the laser scanners with the walls on the map to try to find the best match." · "Localization: This process determines the robot's current position on the map based on input from the motor encoders, inertial measurement unit (IMU), and safety laser scanners." · "the local planner continuously guides the robot around detected obstacles that are not included on the map." |
| S6 | ROS 2 Navigation (Nav2), package *nav2_amcl*, https://index.ros.org/p/nav2_amcl/ | accessed 2026-11-02 | "Adaptive Monte Carlo Localization (AMCL) is a probabilistic localization module which estimates the position and orientation (i.e. Pose) of a robot in a given known map using a 2D laser scanner." |
| S7 | ROS 2 Navigation (Nav2), package *nav2_costmap_2d*, https://index.ros.org/p/nav2_costmap_2d/ | accessed 2026-11-02 | "This package provides an implementation of a 2D costmap that takes in sensor data from the world, builds a 2D or 3D occupancy grid of the data …" |

## Claims → sources
| # | claim (voice / screen) | source | note |
|---|---|---|---|
| C1 | "GPS struggles inside a warehouse." · signal rings fade at the roof | S1 (indoor use and building blockage degrade GPS) | "struggles" = degraded, not "never works" |
| C2 | "A lidar-equipped robot sends out laser pulses and times their reflections." · one pulse out/back + stopwatch | S2, S3 | phrased "a lidar-equipped robot" (other robots use other sensors) |
| C3 | "Those distances outline nearby walls and shelves." · scan points join into outlines | S2, S3 (ranges → points), S5 (scanner data builds the map) | the "1.0 m" readout is a schematic scale for the miniature |
| C4 | "It builds a map, then matches fresh measurements to that map to estimate its position." · map sheet unfolds; fresh scan slides into alignment; shelf corners matched; pin | S4, S5 ("compares the input from the laser scanners with the walls on the map to try to find the best match"), S6 | "estimate" (probabilistic), not "knows exactly"; MiR also uses encoders/IMU — not claimed otherwise |
| C5 | "Mapping and locating, working together." | S4 (SLAM definition) | plain words, no acronym lecture |
| C6 | "Move a crate, and new measurements reveal it, so the robot can plan around it." · crate hits in magenta; path re-routes | S5 (laser scanners detect obstacles; local planner guides around obstacles not on the map), S7 (costmap from live sensor data) | "can plan around it" — capability, not a guarantee |
| C7 | "Follow Media Diet for technology explained." | — | brand CTA; no app capability claimed |

## Schematic / creative elements (not claims)
The paper warehouse, robot design, satellite cut-out, map sheet, threads, pin, path strips, scan density and timing are
illustrative. Real lidars sweep many times per second; here one slowed sweep per measurement is shown.
