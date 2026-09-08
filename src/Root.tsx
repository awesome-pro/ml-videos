import { Composition } from "remotion";
import { scenes } from "./scenes";
import "./index.css";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {scenes.map((scene) => (
        <Composition
          key={scene.id}
          id={scene.id}
          component={scene.component}
          durationInFrames={scene.durationInFrames}
          fps={scene.fps}
          width={scene.width}
          height={scene.height}
          defaultProps={scene.defaultProps}
        />
      ))}
    </>
  );
};
