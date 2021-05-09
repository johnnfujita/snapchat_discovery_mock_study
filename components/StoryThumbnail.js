// @flow
import  React from "react";
import {
  View, StyleSheet, Image, Dimensions, TouchableWithoutFeedback, Platform
} from "react-native";
import  Constants  from "expo-constants";
const margin = 16;
const borderRadius = 6;
const width = Dimensions.get("window").width / 2 - 16 * 2;
const offset = (v) => (Platform.OS === "android" ? (v + Constants.statusBarHeight) : v);

export default class StoryThumbnail extends React.PureComponent {

  ref = React.createRef();

  measure = async () => new Promise(
    resolve => this.ref.current.measureInWindow((x, y, width, height ) => resolve({x, y: offset(y), width, height}) )
  );

  render() {
    const { ref } = this;
    const { story, onPress, selected } = this.props;
    return (
      <TouchableWithoutFeedback {...{onPress}}>
        <View style={styles.container}>
          {
            !selected && (
              <Image {...{ref}} source={story.source} style={styles.image} />
            )  
          }
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width,
    height: width * 1.77,
    marginTop: 16,
    borderRadius
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: width,
    height: width * 1.77,
    resizeMode: "cover",
    borderRadius
  },
});
