import * as React from "react";
import { View, StyleSheet, Image, Dimensions } from "react-native";
import {Video}  from "expo-av";
import Animated from "react-native-reanimated";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { Platform } from "@unimodules/core";

const { width: wWidth, height: wHeight } = Dimensions.get("window");

const { 
    set,
    Value,
    cond,
    eq,
    add,
    and,
    lessOrEq,
    multiply,
    lessThan,
    spring,
    greaterThan,
    startClock,
    stopClock,
    interpolate,
    defined,
    Clock,
    call,
    event,
    block,
    clockRunning
} = Animated;


function runSpring(value,  dest) {
    const clock = new Clock();
    const state = {
        finished: new Value(0),
        velocity: new Value(0),
        position: new Value(0),
        time: new Value(0)
    };

    const config = {
        toValue: new Value(0),
        damping: 10,
        mass: 1,
        stiffness: 100,
        overshootClamping: false,
        restSpeedThreshold: 0.001,
        restDisplacementThereshold: 0.001,
        
    };

    return block([
        cond(clockRunning(clock), 0, [
        set(state.finished, 0),
        set(state.time, 0),
        set(state.velocity, 0),
        set(state.position, value),
        set(config.toValue, dest),
        startClock(clock)
    ]),
    spring(clock, state, config),
    cond(state.finished, stopClock(clock)),
    set(value, state.position)
    ]);
}

export default class StoryModal extends React.PureComponent {
    
    constructor(props) {
        super(props);
        const { position } = props;
        this.clock = new Clock();
        const { x, y, width, height } = position;
        this.translateX = new Value(x);
        this.translateY = new Value(y);
        this.width = new Value(width);
        this.height = new Value(height);
        this.velocityY = new Value(0);
        this.state = new Value(State.UNDETERMINED);
        
        this.onGestureEvent = event([{ nativeEvent: { 
            translationX: this.translateX,
            translationY: this.translateY,
            velocityY: this.velocityY,
            state: this.state,
         } }],{ useNativeDriver: true })
    }

    render() {
        const { translateX, translateY, width, height, onGestureEvent } = this; 
        const { story, position, onRequestClose } = this.props;
        const style = {
            borderRadius: 5,
            width,
            height,
            transform: [
                { translateX },
                { translateY }
            ]
        }
        return(
            <React.Fragment>
                <Animated.Code>
                    {  Platform.OS === "ios" ? 
                        () => block([
                            cond(eq(this.state, State.UNDETERMINED), runSpring(translateX, 0)),
                            cond(eq(this.state, State.UNDETERMINED), runSpring(translateY, 0)),
                            cond(eq(this.state, State.UNDETERMINED), runSpring(width, wWidth)),
                            cond(eq(this.state, State.UNDETERMINED), runSpring(height, wHeight)),
                            cond(and(eq(this.state, State.END), lessOrEq(this.velocityY, 0)), block([
                                runSpring(translateX, 0),
                                runSpring(translateY, 0),
                                runSpring(width, wWidth),
                                runSpring(height, wHeight)
                            ])),
                            cond(and(eq(this.state, State.END), greaterThan(this.velocityY, 0)), block([
                                runSpring(translateX, this.props.position.x),
                                runSpring(translateY, this.props.position.y),
                                runSpring(width, this.props.position.width),
                                runSpring(height, this.props.position.height),
                                cond(eq(this.height, position.height), call([], onRequestClose))
                            ])),
                            cond(eq(this.state, State.ACTIVE), set(this.width, interpolate(this.translateY, {
                                inputRange: [wHeight / 4, wHeight - position.height],
                                outputRange: [wWidth, position.width],
                            }))),
                            cond(eq(this.state, State.ACTIVE), set(this.height, interpolate(this.translateY, {
                                inputRange: [wHeight / 4, wHeight -position.height],
                                outputRange: [wHeight, position.height]
                            })))
                        ]) : null
                    }
                </Animated.Code>
                <PanGestureHandler
                    activeOffsetY={100}
                    onHandlerStateChange={onGestureEvent}
                    {...{onGestureEvent}}
                >
                    <Animated.View {...{ style }}>
                        {
                            !story.video && (
                                <Image source={story.source} style={styles.image} />
                            )
                        }
                        {
                            story.video && (
                                <Video
                                    source={story.video}
                                    rate={1.0}
                                    volume={1.0}
                                    isMuted={false}
                                    resizeMode="cover"
                                    shouldPlay
                                    isLooping
                                    style={styles.video}
                                />
                            )
                        }                  
                    </Animated.View>
                </PanGestureHandler>
            </React.Fragment>
        );
    }
}

const styles = StyleSheet.create({
    image: {
        ...StyleSheet.absoluteFillObject,
        
        width: null,
        height: null,
        borderRadius: 6,
    },
    Video: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 6,
    }
})