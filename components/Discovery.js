// @flow
import * as React from "react";
import {
  View, StyleSheet, ScrollView, SafeAreaView,
} from "react-native";

import StoryThumbnail from "./StoryThumbnail";
import StoryModal from "./StoryModal";



export default class Discovery extends React.PureComponent {
  state = {
    story: null
  }

  thumbnails = {};

  constructor(props) {
    super(props);
    props.stories.forEach((story) => {
      this.thumbnails[story.id] = React.createRef();
    });
  }

  


  goToStory = async (story) => {
    const position = await this.thumbnails[story.id].current.measure();
    console.log({ position })
    this.setState({ story, position });
  }
  
  onRequestClose = () => this.setState({story: null, position: null});

  render() {
    const { onRequestClose} = this;
    const { stories } = this.props;
    const { story, position } = this.state;
    return (
      <View style={styles.flex}>
        <ScrollView 
          style={styles.flex} 
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
        >
          <SafeAreaView style={styles.container}>
            {stories.map( item => 
              <StoryThumbnail 
                ref={this.thumbnails[item.id]}
                key={item.id} 
                onPress={() => this.goToStory(item)} 
                story={item}
                selected={!!story && story.id === item.id}
                />
            )}
          </SafeAreaView>
        </ScrollView>
        {
          story !== null && (
            <View style={StyleSheet.absoluteFill}>
              <StoryModal {...{story, position, onRequestClose }}/>
            </View>
          )
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
  },
});
