/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useEffect, useState, useRef } from 'react';

import useFace from '../../../hooks/demo/use-face';
import useHover from '../../../hooks/demo/use-hover';
import useTilt from '../../../hooks/demo/use-tilt';
import { useLiveAPIContext } from '../../../contexts/LiveAPIContext';

// Minimum volume level that indicates audio output is occurring
const AUDIO_OUTPUT_DETECTION_THRESHOLD = 0.05;

// Amount of delay between end of audio output and setting talking state to false
const TALKING_STATE_COOLDOWN_MS = 2000;

type BasicFaceProps = {
  /** The radius of the face. */
  radius?: number;
  /** The color of the face. */
  color?: string;
};

export default function BasicFace({
  radius = 250,
  color,
}: BasicFaceProps) {
  // FIX: Use `number` for setTimeout return type in browser environments instead of `NodeJS.Timeout`.
  const timeoutRef = useRef<number | null>(null);

  // Audio output volume
  const { volume } = useLiveAPIContext();

  // Talking state
  const [isTalking, setIsTalking] = useState(false);

  const [scale, setScale] = useState(0.1);

  // Face state
  const { eyeScale, mouthScale } = useFace();
  const hoverPosition = useHover();
  const tiltAngle = useTilt({
    maxAngle: 5,
    speed: 0.075,
    isActive: isTalking,
  });

  useEffect(() => {
    function calculateScale() {
      setScale(Math.min(window.innerWidth, window.innerHeight) / 1000);
    }
    window.addEventListener('resize', calculateScale);
    calculateScale();
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  // Detect whether the agent is talking based on audio output volume
  // Set talking state when volume is detected
  useEffect(() => {
    if (volume > AUDIO_OUTPUT_DETECTION_THRESHOLD) {
      setIsTalking(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      // Enforce a slight delay between end of audio output and setting talking state to false
      timeoutRef.current = window.setTimeout(
        () => setIsTalking(false),
        TALKING_STATE_COOLDOWN_MS
      );
    }
  }, [volume]);

  return (
    <div
      className="avatar-container"
      style={{
        width: radius * 2 * scale,
        height: radius * 2 * scale,
        transform: `translateY(${hoverPosition}px) rotate(${tiltAngle}deg)`,
      }}
    >
      <svg
        className="avatar-svg"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient
            id="avatar-gradient"
            cx="50%"
            cy="50%"
            r="50%"
            fx="50%"
            fy="50%"
          >
            <stop
              offset="0%"
              style={{ stopColor: 'white', stopOpacity: 0.2 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: 'white', stopOpacity: 0 }}
            />
          </radialGradient>
        </defs>

        <g className="avatar-body">
          {/* Head */}
          <circle
            cx="100"
            cy="100"
            r="100"
            fill={color || '#4285f4'}
            className="avatar-head"
          />
          <circle cx="100" cy="100" r="100" fill="url(#avatar-gradient)" />

          {/* Eyes */}
          <g className="eyes">
            {/* Left Eye */}
            <g
              className="eye"
              transform={`translate(60, 85)`}
              style={{
                transformBox: 'fill-box',
                transformOrigin: 'center',
                transform: `scaleY(${eyeScale})`,
              }}
            >
              <circle r="22" fill="white" />
              <circle r="10" fill="black" className="pupil" />
            </g>
            {/* Right Eye */}
            <g
              className="eye"
              transform={`translate(140, 85)`}
              style={{
                transformBox: 'fill-box',
                transformOrigin: 'center',
                transform: `scaleY(${eyeScale})`,
              }}
            >
              <circle r="22" fill="white" />
              <circle r="10" fill="black" className="pupil" />
            </g>
          </g>

          {/* Mouth */}
          <g
            className="mouth"
            transform="translate(100, 150)"
            style={{
              transformBox: 'fill-box',
              transformOrigin: 'center',
              transform: `scaleY(${Math.max(0.1, mouthScale * 3)})`,
            }}
          >
            <path d="M-35,0 a35,15 0 0,0 70,0" fill="black" />
          </g>
        </g>
      </svg>
    </div>
  );
}
