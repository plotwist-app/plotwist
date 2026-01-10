import { View, Text } from "react-native";
import { SvgXml } from "react-native-svg";

import { logoSvg } from "../assets/logo";

export default function App() {
  return (
    <View className="flex-1 bg-background items-center justify-center">
      <SvgXml xml={logoSvg} width={120} height={120} />
      <Text
        className="text-foreground text-4xl mt-6"
        style={{ fontFamily: "SpaceGrotesk_700Bold" }}
      >
        Plotwist
      </Text>
    </View>
  );
}
