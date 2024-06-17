import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  clamp,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';
import {
  Canvas,
  Fill,
  Group,
  Mask,
  Path,
  Rect,
  Shader,
  Skia,
} from '@shopify/react-native-skia';
import { RAD2DEG } from '../../src/commons/constants';

const hsl2rgb = (h: number, s: number, l: number): [number, number, number] => {
  'worklet';
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const huePrime = h / 60;
  const x = c * (1 - Math.abs((huePrime % 2) - 1));
  const m = l - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (huePrime >= 0 && huePrime < 1) {
    r = c;
    g = x;
    b = 0;
  }

  if (huePrime >= 1 && huePrime < 2) {
    r = x;
    g = c;
    b = 0;
  }

  if (huePrime >= 2 && huePrime < 3) {
    r = 0;
    g = c;
    b = x;
  }

  if (huePrime >= 3 && huePrime < 4) {
    r = 0;
    g = x;
    b = c;
  }
  if (huePrime >= 4 && huePrime < 5) {
    r = x;
    g = 0;
    b = c;
  }

  if (huePrime >= 5 && huePrime < 6) {
    r = c;
    g = 0;
    b = x;
  }

  return [
    clamp((r + m) * 255, 0, 255),
    clamp((g + m) * 255, 0, 255),
    clamp((b + m) * 255, 0, 255),
  ];
};

const hsl2rgbFunc = `
  vec3 hsl(float h, float s, float l) {
    float c = (1 - abs(2 * l - 1)) * s;
    float huePrime = h / 60.0;
    float x = c * (1 - abs((mod(huePrime, 2.0)) - 1));
    float m = l - c / 2;

    float r = 0;
    float g = 0;
    float b = 0;

    if (huePrime >= 0 && huePrime < 1) {
      r = c;
      g = x;
      b = 0;
    }

    if (huePrime >= 1 && huePrime < 2) {
      r = x;
      g = c;
      b = 0;
    }

    if (huePrime >= 2 && huePrime < 3) {
      r = 0;
      g = c;
      b = x;
    }

    if (huePrime >= 3 && huePrime < 4) {
      r = 0;
      g = x;
      b = c;
    }
    if (huePrime >= 4 && huePrime < 5) {
      r = x;
      g = 0;
      b = c;
    }

    if (huePrime >= 5 && huePrime < 6) {
      r = c;
      g = 0;
      b = x;
    }

    return vec3(r + m, g + m, b + m);
  }
`;

const hueShader = Skia.RuntimeEffect.Make(`
  uniform vec2 canvas;

  const float PI = 3.141592653589793;

  ${hsl2rgbFunc}

  vec4 main(vec2 xy) {
    vec2 uv = xy / canvas;
    vec2 pos = vec2(uv.x - 0.5, -1 * (uv.y - 0.5));
    float angle = atan(pos.y, pos.x);
    
    float result = mod(angle + (2 * PI), 2 * PI) * (180 / PI);

    return vec4(hsl(result, 1, 0.5), 1);
  }
  `)!;

const shader = Skia.RuntimeEffect.Make(`
  uniform vec2 canvas;
  uniform float hue;

  const float PI = 3.141592653589793;

  ${hsl2rgbFunc}

  float inOut(float x) {
    return 1 - (1 - x) * (1 - x);
  }

  vec4 main(vec2 xy) {
    vec2 uv = xy / canvas;
    vec2 pos = (xy / canvas) - 0.5;
    float angle = atan(pos.y, pos.x);
    
    float result = mod(angle + (2 * PI), 2 * PI) * (180 / PI);

    return vec4(hsl(hue, inOut(uv.x), 1 - uv.y), 1);
  }
`)!;

type pingaProps = {};

const STROKE_WIDTH = 25;
const RAG2DEG = 180 / Math.PI;
const TAU = 2 * Math.PI;

const DEG150 = 150 * (Math.PI / 180);
const DEG210 = 210 * (Math.PI / 180);

const height = 200;
const width = Math.cos(Math.PI / 6) * height;
const radiusDiff = Math.tan(Math.PI / 6) * (height / 2);
const radius = width - radiusDiff + STROKE_WIDTH;

const triangle = Skia.Path.MakeFromSVGString(`
  M 0 0 l ${width} ${height / 2} l ${-width} ${height / 2}
`)!;

const circle = Skia.Path.MakeFromSVGString(`
  M ${STROKE_WIDTH / 2} ${radius} 
  a 1 1 0 0 1 ${radius * 2 - STROKE_WIDTH} ${0} 
  a 1 1 0 0 1 ${-1 * radius * 2 + STROKE_WIDTH} ${0} 
  z
`)!;

function getInitalHue() {
  const [r, g, b] = hsl2rgb(0, 1, 0.5);
  return `rgba(${r}, ${g}, ${b}, 1)`;
}

function getInitalColor() {
  const [r, g, b] = hsl2rgb(0, radiusDiff / width, 0.5);
  return `rgba(${r}, ${g}, ${b}, 1)`;
}

const useVector = (x: number, y?: number) => {
  const first = useSharedValue<number>(x);
  const second = useSharedValue<number>(y ?? x);

  return { x: first, y: second };
};

const Pinga: React.FC<pingaProps> = ({}) => {
  const translate = useVector((radius - STROKE_WIDTH / 2) * Math.cos(0), 0);
  const offset = useVector(0, 0);

  const select = useVector(0, 0);
  const selectOffset = useVector(0, 0);

  const angle = useSharedValue<number>(0);

  const hueColor = useSharedValue<string>(getInitalHue());
  const finalColor = useSharedValue<string>(getInitalColor());

  const shaderUniforms = useDerivedValue(() => {
    return {
      hue: angle.value * RAG2DEG,
      canvas: [width, height],
    };
  }, [angle, width, height]);

  useAnimatedReaction(
    () => angle.value * RAG2DEG,
    (value) => {
      const [r, g, b] = hsl2rgb(value, 1, 0.5);
      hueColor.value = `rgba(${r}, ${g}, ${b}, 1)`;
    },
    [angle]
  );

  useAnimatedReaction(
    () => ({
      hue: angle.value * RAD2DEG,
      x: select.x.value,
      y: select.y.value,
    }),
    (data) => {
      const x = (data.x + radiusDiff) / width;

      const [r, g, b] = hsl2rgb(
        data.hue,
        1 - (1 - x) * (1 - x),
        (height - (data.y + height / 2)) / height
      );
      finalColor.value = `rgba(${r}, ${g}, ${b}, 1)`;
    },
    [angle, select]
  );

  const sliderPan = Gesture.Pan()
    .hitSlop({ vertical: 5, horizontal: 5 })
    .onBegin((_) => {
      offset.x.value = translate.x.value;
      offset.y.value = translate.y.value;
    })
    .onUpdate((e) => {
      const x = offset.x.value + e.translationX;
      const y = -1 * (offset.y.value + e.translationY);

      angle.value = (Math.atan2(y, x) + TAU) % TAU;
      translate.x.value = (radius - STROKE_WIDTH / 2) * Math.cos(angle.value);
      translate.y.value =
        -1 * (radius - STROKE_WIDTH / 2) * Math.sin(angle.value);
    });

  const selectorPan = Gesture.Pan()
    .onBegin(() => {
      selectOffset.x.value = select.x.value;
      selectOffset.y.value = select.y.value;
    })
    .onUpdate((e) => {
      const x = selectOffset.x.value + e.translationX;
      const y = selectOffset.y.value + e.translationY;

      const normalizedX = clamp(
        x - (radius - STROKE_WIDTH),
        -1 * (radius - STROKE_WIDTH + radiusDiff),
        0
      );
      const normalizedY = -1 * y;

      const tempAngle = (Math.atan2(normalizedY, normalizedX) + TAU) % TAU;
      const cangle = clamp(tempAngle, DEG150, DEG210);
      const toY = Math.abs(Math.tan(cangle) * normalizedX);

      select.x.value = clamp(x, -1 * radiusDiff, radius - STROKE_WIDTH);
      select.y.value = clamp(y, -1 * toY, toY);
    });

  const selectorAnimatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: finalColor.value,
      transform: [
        { translateX: select.x.value },
        { translateY: select.y.value },
      ],
    };
  });

  const animatedSliderStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: hueColor.value,
      transform: [
        { translateX: translate.x.value },
        { translateY: translate.y.value },
      ],
    };
  });

  const sliderStyle: ViewStyle = {
    width: radius * 2,
    height: radius * 2,
    position: 'absolute',
  };

  return (
    <View style={styles.root}>
      <Canvas style={sliderStyle}>
        <Mask
          mode="luminance"
          mask={
            <Path
              path={circle}
              style={'stroke'}
              strokeWidth={STROKE_WIDTH}
              color={'#fff'}
            />
          }
        >
          <Rect x={0} y={0} width={radius * 2} height={radius * 2}>
            <Shader
              source={hueShader}
              uniforms={{ canvas: [radius * 2, radius * 2] }}
            />
          </Rect>
        </Mask>
      </Canvas>

      <Canvas style={styles.canvas}>
        <Group clip={triangle}>
          <Fill>
            <Shader source={shader} uniforms={shaderUniforms} />
          </Fill>
        </Group>
      </Canvas>

      <GestureDetector gesture={sliderPan}>
        <Animated.View style={[styles.selector, animatedSliderStyle]} />
      </GestureDetector>

      <GestureDetector gesture={selectorPan}>
        <Animated.View style={[styles.selector, selectorAnimatedStyle]} />
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2c2c2c',
  },
  canvas: {
    width,
    height,
    transform: [{ translateX: (radius * 2 - width) / 2 - STROKE_WIDTH }],
  },
  selector: {
    width: STROKE_WIDTH,
    height: STROKE_WIDTH,
    borderColor: '#fff',
    borderWidth: 4,
    borderRadius: STROKE_WIDTH / 2,
    position: 'absolute',
  },
  wheel: {
    width: radius * 2,
    height: radius * 2,
    backgroundColor: 'orange',
    position: 'absolute',
    borderRadius: radius,
    borderColor: '#fff',
  },
});

export default Pinga;
