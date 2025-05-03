import React, { useState } from "react";
import { Image } from "react-native";
import { View, Text } from "react-native";
import { ImageProps } from "react-native";

type Props = {
  src: string;
  fallbackSrc: string;
  className?: string;
  alt?: string;
};

const ImageWithFallback = ({ src, fallbackSrc, className, alt }: Props) => {
  const [error, setError] = useState(false);

  return (
    <Image
      source={{ uri: error ? fallbackSrc : src }}
      onError={() => setError(true)}
      accessibilityLabel={alt}
      className={className}
      resizeMode="cover"
    />
  );
};

export default ImageWithFallback;
