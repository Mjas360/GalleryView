import {
  View,
  Text,
  FlatList,
  Image,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";
import Config from "react-native-config";

const apiKey = Config.API_KEY ?? "";

const { width, height } = Dimensions.get("screen");

const IMAGE_SIZE = 80;
const SPACING = 10;

const API_URL =
  "https://api.pexels.com/v1/search?query=nature&orientation=portrait&size=small&per_page=20";

const fetchImagesFromPexels = async () => {
  const data = await fetch(API_URL, {
    headers: {
      Authorization: apiKey,
    },
  });

  const { photos } = await data.json();

  return photos;
};

export default function Gallery() {
  const [images, setImages] = React.useState(null);
  const topRef = React.useRef<any>();
  const thumbRef = React.useRef<any>();
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    const fetchImages = async () => {
      const images = await fetchImagesFromPexels();
      setImages(images);
    };

    fetchImages();
  }, []);

  if (!images) {
    return <Text>Loading...</Text>;
  }

  const updateActiveIndex = (index: number) => {
    setActiveIndex(index);

    //scroll flatlist
    //each slide is screen width then multiply by index to scroll to corresponding index
    topRef?.current?.scrollToOffset({
      offset: index * width,
      animated: true,
    });

    // scroll active slide to be in the middle of the screen
    //if the middle of active thumbbail is > than the middle of the screen then move to middle of the screen
    const isMiddleOfActiveThumbnailGreaterThanMiddleOfScreen = Number(
      index * IMAGE_SIZE + SPACING - IMAGE_SIZE / 2 > width / 2
    );

    if (isMiddleOfActiveThumbnailGreaterThanMiddleOfScreen) {
      thumbRef?.current?.scrollToOffset({
        offset: index * (IMAGE_SIZE + SPACING) - width / 2 + IMAGE_SIZE / 2,
        animated: true,
      });
    } //below half of the screen
    else {
      thumbRef?.current?.scrollToOffset({
        offset: 0,
        animated: true,
      });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF" }}>
      <StatusBar style="auto" />
      <FlatList
        ref={topRef}
        data={images}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(ev) => {
          // get active index of current image
          updateActiveIndex(Math.floor(ev.nativeEvent.contentOffset.x / width));
        }}
        renderItem={({ item }) => {
          return (
            <View style={{ width, height }}>
              {/* <Text>{item.src.portrait}</Text> */}
              <Image
                source={{ uri: item.src.portrait }}
                style={[StyleSheet.absoluteFillObject]}
              />
            </View>
          );
        }}
      />

      <FlatList
        ref={thumbRef}
        data={images}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ position: "absolute", bottom: IMAGE_SIZE / 2 }}
        contentContainerStyle={{ paddingHorizontal: SPACING }}
        renderItem={({ item, index }) => {
          return (
            <TouchableOpacity onPress={() => updateActiveIndex(index)}>
              <Image
                source={{ uri: item.src.portrait }}
                style={{
                  width: IMAGE_SIZE,
                  height: IMAGE_SIZE,
                  borderRadius: 12,
                  margin: SPACING,
                  borderWidth: 2,
                  borderColor: activeIndex === index ? "#FFF" : "transparent",
                }}
              />
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
