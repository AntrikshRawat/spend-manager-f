import Lottie from "lottie-react";
import { useEffect, useState } from "react";

export default function LottieAnimation() {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    // Load the animation JSON file
    fetch("/smartspend.json")
      .then((response) => response.json())
      .then((data) => {
        setAnimationData(data);
      })
      .catch((error) => console.error("Error loading animation:", error));
  }, []);

  if (!animationData) {
    return null; // or a loading spinner
  }

  return (
    <div>
      <Lottie
        animationData={animationData}
        loop={true}
        autoplay={true}
        initialSegment={[0,500]}
        style={{ width: "100%"}}
      />
    </div>
  );
}
