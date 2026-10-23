'use client';

/**
 * 数字人入口：优先 VRM 身体，失败则回退程序化人形。
 */
import { Suspense, useCallback, useState } from 'react';
import { AriaHumanoid, type HumanoidGoal } from './AriaHumanoid';
import { AriaVRM } from './AriaVRM';
import type { AriaDriveRefs } from './AriaWorld';

type Props = {
  goal: HumanoidGoal;
  drive?: AriaDriveRefs;
};

export function AriaAvatar({ goal, drive }: Props) {
  const [vrmFailed, setVrmFailed] = useState(false);

  const onError = useCallback((err: Error) => {
    console.warn('[AriaAvatar] VRM load failed, fallback to procedural', err.message);
    setVrmFailed(true);
  }, []);

  if (vrmFailed) {
    return <AriaHumanoid goal={goal} />;
  }

  return (
    <Suspense fallback={<AriaHumanoid goal={goal} />}>
      <AriaVRM goal={goal} onError={onError} photoFace drive={drive} />
    </Suspense>
  );
}
