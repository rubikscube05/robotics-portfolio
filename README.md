# Robotics Mission Control — updated implementation

## Install

```bash
npm install three framer-motion lucide-react
```

If this is a Vite React TypeScript project, the normal React/Vite dependencies should already be present.

## Use

Replace the existing mission-control component with:

`src/robotics_mission_control.tsx`

Then render `<App />` from your existing app entry point.

## Assets

Put actual models here:

```text
public/models/drone.glb
public/models/squid.glb
public/models/rover.glb
```

If a model is absent, the app uses a clearly generic engineering placeholder.

Put future mission data here:

```text
public/data/autonomous-landing.json
public/data/squid-robot.json
public/data/gps-drone.json
public/data/swarm-coordination.json
public/data/gesture-drone.json
public/data/mars-rover.json
public/data/wall-writing-uav.json
public/data/mine-detection-uav.json
```

A JSON file should contain:

```json
{
  "robot": "UAV-01",
  "dataSource": "real_flight",
  "duration": 20,
  "telemetry": [
    {
      "time": 0,
      "position": [0, 0, 0],
      "rotation": [0, 0, 0],
      "altitude": 0,
      "velocity": 0,
      "heading": 0,
      "state": "ARMED"
    }
  ]
}
```

Allowed `dataSource` values:

- `demo`
- `real_flight`
- `rosbag`

The UI will not label demo data as real flight data.

## Images / videos / CAD

Store them under `public/media/` and add their real paths to the relevant project's `media` object.

Only supplied links should be added to `links`.

## Important

The supplied source contained generated/example engineering claims and placeholder GitHub URLs. The updated implementation deliberately removes those claims and links rather than presenting them as verified results.
