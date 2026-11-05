import { phoneRanking, phoneRankRowHeight, rankOrdinal, PHONE_RANK_ROW_MAX, type MyPlace, type PhoneRankRow } from '@shared/phoneRanking';
import type { PlayerId, PublicSession } from '@shared/types';
import { useState } from 'react';
import { Animated, Easing, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { gradientStyle } from '@/components/ui/gradient';
import { CountUpText, popScale, useEntrance, useLoop, useReduceMotion } from '@/components/ui/motion';
import { AppColors, AppFonts, AppShadows, AppSizes, DISPLAY_LINE_HEIGHT, RankCardGradient, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

const texts = strings.game.ranking;

// Calendrier (version C) : carte qui glisse, place qui défile à 0,3 s, points sur 1,2 s, barre vers le 1er sur 0,9 s,
// pastille à 1,4 s, reflet à 1 s ; lignes du top 5 en décalé, chaque barre après sa ligne. Rien ne retarde les boutons.
const CARD_MS = 500;
const PLACE_DELAY_MS = 300;
const POINTS_MS = 1_200;
const BAR_DELAY_MS = 500;
const BAR_MS = 900;
const SHINE_DELAY_MS = 1_000;
const SHINE_MS = 800;
const PILL_DELAY_MS = 1_400;
const PILL_MS = 400;
const PILL_BOUNCE_MS = 1_600;
const AVATAR_SWAY_MS = 2_400;
const ROW_MS = 500;
const ROW_STEP_MS = 120;
const ROW_BAR_MS = 600;
const FLASH_DELAY_MS = 900;
const FLASH_MS = 1_400;
const ROW_GAP = 8;
const ROW_GAP_TIGHT = 3;
const SMALL_SCREEN_HEIGHT = 700;

// Classement du téléphone après chaque question : ta place en vedette, puis le top 5.
export function PhoneRankingView({ session, uid, isRound }: { session: PublicSession; uid: PlayerId; isRound: boolean }) {
  const ranking = phoneRanking(session, uid);
  const isAnimated = !useReduceMotion();
  const isSmall = useWindowDimensions().height < SMALL_SCREEN_HEIGHT;
  const [listHeight, setListHeight] = useState(0);
  const allRows = ranking.myRowOutside ? [...ranking.rows, ranking.myRowOutside] : ranking.rows;
  // La ligne « … » et « et N autres » prennent une place fixe, retirée de celle des lignes.
  const heightWith = (gap: number) => {
    const extra = (ranking.myRowOutside ? DOTS_HEIGHT + gap : 0) + (ranking.othersCount > 0 ? OTHERS_HEIGHT + gap : 0);
    return listHeight > 0 ? phoneRankRowHeight(listHeight - extra, allRows.length, gap) : PHONE_RANK_ROW_MAX;
  };
  // Lignes déjà réduites : l'espace entre elles se resserre d'abord.
  const rowGap = heightWith(ROW_GAP) < PHONE_RANK_ROW_MAX ? ROW_GAP_TIGHT : ROW_GAP;
  const rowHeight = heightWith(rowGap);

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title} numberOfLines={1}>
          {texts.title}
        </Text>
        <Text style={styles.progress} numberOfLines={1}>
          {strings.game.questionProgress(session.currentIndex, session.questionCount, isRound)}
        </Text>
      </View>
      {ranking.me && <PlaceCard me={ranking.me} isAnimated={isAnimated} isSmall={isSmall} />}
      {ranking.isTopFive && <Text style={styles.topLabel}>{texts.topFive}</Text>}
      <View style={[styles.list, { gap: rowGap }]} onLayout={(event) => setListHeight(event.nativeEvent.layout.height)}>
        {ranking.rows.map((row, position) => (
          <RankRow key={row.id} row={row} position={position} height={rowHeight} isAnimated={isAnimated} />
        ))}
        {ranking.myRowOutside && (
          <>
            <Text style={styles.dots}>{texts.dots}</Text>
            <RankRow row={ranking.myRowOutside} position={ranking.rows.length} height={rowHeight} isAnimated={isAnimated} />
          </>
        )}
        {ranking.othersCount > 0 && <Text style={styles.others}>{texts.others(ranking.othersCount)}</Text>}
      </View>
    </View>
  );
}

function PlaceCard({ me, isAnimated, isSmall }: { me: MyPlace; isAnimated: boolean; isSmall: boolean }) {
  const slide = useEntrance({ durationMs: CARD_MS, isAnimated });
  const shine = useEntrance({ delayMs: SHINE_DELAY_MS, durationMs: SHINE_MS, isAnimated, easing: Easing.inOut(Easing.quad) });
  const sway = useLoop({ durationMs: AVATAR_SWAY_MS, isAnimated });
  const rotate = sway.interpolate({ inputRange: [0, 0.25, 0.75, 1], outputRange: ['0deg', '5deg', '-5deg', '0deg'] });
  return (
    <Animated.View
      style={[
        styles.card,
        isSmall && styles.cardSmall,
        CARD_GRADIENT,
        { opacity: slide, transform: [{ translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [70, 0] }) }] },
      ]}>
      <View style={styles.cardClip} pointerEvents="none">
        <Animated.View
          style={[
            styles.shine,
            {
              opacity: shine.interpolate({ inputRange: [0, 0.1, 0.9, 1], outputRange: [0, 1, 1, 0] }),
              transform: [{ translateX: shine.interpolate({ inputRange: [0, 1], outputRange: [-120, 520] }) }, { rotate: '18deg' }],
            },
          ]}
        />
      </View>
      <View style={styles.cardTop}>
        <Animated.Text style={[styles.cardAvatar, isSmall && styles.cardAvatarSmall, { transform: [{ rotate }] }]}>{me.player.avatar}</Animated.Text>
        <View style={styles.cardPlace}>
          <Text style={styles.cardLabel}>{texts.yourPlace}</Text>
          <PlaceRoll from={me.previousRank} to={me.rank} isAnimated={isAnimated} />
        </View>
        <View style={styles.cardScore}>
          <CountUpText
            from={me.previousScore}
            to={me.score}
            delayMs={PLACE_DELAY_MS}
            durationMs={POINTS_MS}
            isAnimated={isAnimated}
            format={texts.score}
            style={[styles.cardPoints, isSmall && styles.cardPointsSmall]}
          />
          {me.movement !== null && <MovePill movement={me.movement} isAnimated={isAnimated} />}
        </View>
      </View>
      <Standing me={me} isAnimated={isAnimated} />
    </Animated.View>
  );
}

const PLACE_HEIGHT = 56;

// La place défile comme un compteur, de la précédente à la nouvelle, avec un « pop » du bloc.
function PlaceRoll({ from, to, isAnimated }: { from: number; to: number; isAnimated: boolean }) {
  const hasChanged = from !== to && isAnimated;
  const roll = useEntrance({ delayMs: PLACE_DELAY_MS, durationMs: 500, isAnimated: hasChanged });
  const pop = useEntrance({ delayMs: PLACE_DELAY_MS, durationMs: 500, isAnimated, easing: Easing.linear });
  const translateY = roll.interpolate({ inputRange: [0, 1], outputRange: [0, -PLACE_HEIGHT] });
  return (
    <Animated.View style={[styles.placeWindow, { transform: [{ scale: popScale(pop) }] }]}>
      {hasChanged ? (
        <Animated.View style={{ transform: [{ translateY }] }}>
          <PlaceText rank={from} />
          <PlaceText rank={to} />
        </Animated.View>
      ) : (
        <PlaceText rank={to} />
      )}
    </Animated.View>
  );
}

function PlaceText({ rank }: { rank: number }) {
  const { number, suffix } = rankOrdinal(rank);
  return (
    <Text style={styles.placeLine}>
      <Text style={styles.placeNumber}>{number}</Text>
      <Text style={styles.placeSuffix}>{suffix}</Text>
    </Text>
  );
}

function MovePill({ movement, isAnimated }: { movement: number; isAnimated: boolean }) {
  const pop = useEntrance({ delayMs: PILL_DELAY_MS, durationMs: PILL_MS, isAnimated, easing: Easing.linear });
  const bounce = useLoop({ delayMs: PILL_DELAY_MS + PILL_MS, durationMs: PILL_BOUNCE_MS, isAnimated: isAnimated && movement !== 0 });
  const translateY = bounce.interpolate({ inputRange: [0, 0.15, 0.3, 1], outputRange: [0, -3, 0, 0] });
  const isUp = movement > 0;
  const color = movement === 0 ? AppColors.ink : isUp ? AppColors.rankPillUp : AppColors.rankPillDown;
  return (
    <Animated.View style={[styles.pill, { opacity: pop, transform: [{ scale: popScale(pop) }, { translateY }] }]}>
      {movement !== 0 && <Triangle isUp={isUp} color={color} size={5} />}
      <Text style={[styles.pillText, { color }]}>{movement === 0 ? texts.same : texts.places(Math.abs(movement))}</Text>
    </Animated.View>
  );
}

function Standing({ me, isAnimated }: { me: MyPlace; isAnimated: boolean }) {
  const { standing } = me;
  if (standing.kind === 'tied') return <Text style={styles.standing}>{texts.tied(standing.withName)}</Text>;
  if (standing.kind === 'leader') {
    return (
      <View style={styles.standingBlock}>
        <Text style={styles.standing}>{texts.leader}</Text>
        {standing.lead && <Text style={styles.standingDetail}>{texts.lead(standing.lead.points, standing.lead.name)}</Text>}
      </View>
    );
  }
  return (
    <View style={styles.standingBlock}>
      <Text style={styles.standing} numberOfLines={1}>
        {texts.gap(standing.gap, standing.leaderName)}
      </Text>
      <FillBar share={standing.share} delayMs={BAR_DELAY_MS} durationMs={BAR_MS} isAnimated={isAnimated} trackStyle={styles.cardTrack} fillStyle={styles.cardFill} />
    </View>
  );
}

interface FillBarProps {
  share: number;
  delayMs: number;
  durationMs: number;
  isAnimated: boolean;
  trackStyle: object;
  fillStyle: object;
}

// Barre qui se remplit : scaleX depuis la gauche, par le pilote natif.
function FillBar({ share, delayMs, durationMs, isAnimated, trackStyle, fillStyle }: FillBarProps) {
  const fill = useEntrance({ delayMs, durationMs, isAnimated });
  const scaleX = fill.interpolate({ inputRange: [0, 1], outputRange: [0, Math.max(0.001, share)] });
  return (
    <View style={[styles.track, trackStyle]}>
      <Animated.View style={[styles.fill, fillStyle, { transform: [{ scaleX }] }]} />
    </View>
  );
}

function Triangle({ isUp, color, size }: { isUp: boolean; color: string; size: number }) {
  return (
    <View
      style={[
        styles.triangle,
        { borderLeftWidth: size, borderRightWidth: size },
        isUp ? { borderBottomWidth: size * 1.6, borderBottomColor: color } : { borderTopWidth: size * 1.6, borderTopColor: color },
      ]}
    />
  );
}

function RowMovement({ movement }: { movement: number | null }) {
  if (movement === null) return <View style={styles.rowMove} />;
  if (movement === 0) return <View style={styles.rowMove}><Text style={[styles.rowMoveText, styles.rowMoveSame]}>{texts.same}</Text></View>;
  const isUp = movement > 0;
  const color = isUp ? AppColors.rankUp : AppColors.rankDown;
  return (
    <View style={styles.rowMove}>
      <Triangle isUp={isUp} color={color} size={4} />
      <Text style={[styles.rowMoveText, { color }]}>{Math.abs(movement)}</Text>
    </View>
  );
}

function RankRow({ row, position, height, isAnimated }: { row: PhoneRankRow; position: number; height: number; isAnimated: boolean }) {
  const delayMs = position * ROW_STEP_MS;
  const enter = useEntrance({ delayMs, durationMs: ROW_MS, isAnimated });
  const hasClimbed = row.isMe && (row.movement ?? 0) > 0 && isAnimated;
  const flash = useEntrance({ delayMs: FLASH_DELAY_MS, durationMs: FLASH_MS, isAnimated: hasClimbed, easing: Easing.linear });
  const isCompact = height < PHONE_RANK_ROW_MAX - 8;
  const isTiny = height < 36;
  return (
    <Animated.View
      style={[
        styles.row,
        row.isMe && styles.rowMine,
        { height, opacity: enter, transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] },
      ]}>
      {hasClimbed && (
        <Animated.View pointerEvents="none" style={[styles.rowFlash, { opacity: flash.interpolate({ inputRange: [0, 1], outputRange: [0.75, 0] }) }]} />
      )}
      <Text style={styles.rowRank}>{row.player.rank}</Text>
      <Text style={[styles.rowAvatar, isCompact && styles.rowAvatarCompact]}>{row.player.avatar}</Text>
      <View style={styles.rowMiddle}>
        <Text style={[styles.rowName, isCompact && styles.rowNameCompact]} numberOfLines={1}>
          {row.isMe ? texts.me : row.player.name}
        </Text>
        <FillBar
          share={row.share}
          delayMs={delayMs + ROW_MS}
          durationMs={ROW_BAR_MS}
          isAnimated={isAnimated}
          trackStyle={isTiny ? styles.rowTrackTiny : styles.rowTrack}
          fillStyle={{ backgroundColor: AppColors.rankBars[row.colorIndex] }}
        />
      </View>
      <Text style={styles.rowScore}>{texts.score(row.player.score ?? 0)}</Text>
      <RowMovement movement={row.movement} />
    </Animated.View>
  );
}

const CARD_GRADIENT = gradientStyle(RankCardGradient);
const DOTS_HEIGHT = 16;
const OTHERS_HEIGHT = 18;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: Spacing.two,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  title: {
    ...TEXT_FIT_SAFETY,
    flexShrink: 1,
    color: AppColors.text,
    fontFamily: AppFonts.display,
    fontSize: 24,
    lineHeight: Math.round(24 * DISPLAY_LINE_HEIGHT),
    textTransform: 'uppercase',
  },
  progress: {
    ...TEXT_FIT_SAFETY,
    flexShrink: 0,
    color: AppColors.questionMeta,
    fontFamily: AppFonts.black,
    fontSize: 14,
  },
  card: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: AppSizes.radiusCard,
    borderWidth: 4,
    borderColor: AppColors.card,
    backgroundColor: AppColors.rankCardBase,
    boxShadow: AppShadows.hard,
  },
  cardSmall: {
    gap: Spacing.one,
    paddingVertical: Spacing.two,
  },
  cardClip: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    borderRadius: AppSizes.radiusCard - 4,
  },
  shine: {
    position: 'absolute',
    top: -40,
    bottom: -40,
    width: 46,
    backgroundColor: AppColors.rankCardShine,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  cardAvatar: {
    fontSize: 46,
    lineHeight: 56,
  },
  cardAvatarSmall: {
    fontSize: 36,
    lineHeight: 44,
  },
  cardPlace: {
    flexGrow: 1,
  },
  cardLabel: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.ink,
    fontFamily: AppFonts.black,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  placeWindow: {
    height: PLACE_HEIGHT,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  placeLine: {
    ...TEXT_FIT_SAFETY,
    height: PLACE_HEIGHT,
    lineHeight: PLACE_HEIGHT,
    color: AppColors.ink,
  },
  placeNumber: {
    fontFamily: AppFonts.display,
    fontSize: 40,
  },
  placeSuffix: {
    fontFamily: AppFonts.display,
    fontSize: 18,
  },
  cardScore: {
    alignItems: 'flex-end',
    gap: 4,
  },
  cardPoints: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.ink,
    fontFamily: AppFonts.display,
    fontSize: 28,
    lineHeight: 38,
  },
  cardPointsSmall: {
    fontSize: 24,
    lineHeight: 32,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: 3,
    borderRadius: AppSizes.radiusPill,
    backgroundColor: AppColors.rankPillBackground,
  },
  pillText: {
    ...TEXT_FIT_SAFETY,
    fontFamily: AppFonts.black,
    fontSize: 13,
  },
  standingBlock: {
    gap: 4,
  },
  standing: {
    color: AppColors.ink,
    fontFamily: AppFonts.black,
    fontSize: 14,
  },
  standingDetail: {
    color: AppColors.ink,
    fontFamily: AppFonts.bold,
    fontSize: 13,
  },
  track: {
    overflow: 'hidden',
    borderRadius: AppSizes.radiusPill,
  },
  fill: {
    width: '100%',
    height: '100%',
    borderRadius: AppSizes.radiusPill,
    transformOrigin: '0% 50%',
  },
  cardTrack: {
    height: 10,
    backgroundColor: AppColors.rankCardTrack,
  },
  cardFill: {
    backgroundColor: AppColors.ink,
  },
  topLabel: {
    color: AppColors.questionMeta,
    fontFamily: AppFonts.black,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  list: {
    flex: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: AppSizes.radiusPill,
    backgroundColor: AppColors.rankRow,
    overflow: 'hidden',
  },
  rowMine: {
    borderWidth: 3,
    borderColor: AppColors.card,
    backgroundColor: AppColors.rankRowMine,
  },
  rowFlash: {
    position: 'absolute',
    inset: 0,
    backgroundColor: AppColors.correct,
  },
  rowRank: {
    ...TEXT_FIT_SAFETY,
    minWidth: 20,
    color: AppColors.text,
    fontFamily: AppFonts.display,
    fontSize: 17,
    textAlign: 'center',
  },
  rowAvatar: {
    fontSize: 24,
  },
  rowAvatarCompact: {
    fontSize: 18,
  },
  rowMiddle: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  rowName: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 14,
  },
  rowNameCompact: {
    fontSize: 13,
    lineHeight: 15,
  },
  rowTrack: {
    height: 7,
    backgroundColor: AppColors.rankTrack,
  },
  rowTrackTiny: {
    height: 4,
    backgroundColor: AppColors.rankTrack,
  },
  rowScore: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 15,
  },
  rowMove: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
    minWidth: 28,
  },
  rowMoveText: {
    ...TEXT_FIT_SAFETY,
    fontFamily: AppFonts.black,
    fontSize: 12,
  },
  rowMoveSame: {
    color: AppColors.textMuted,
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  dots: {
    height: DOTS_HEIGHT,
    lineHeight: DOTS_HEIGHT,
    color: AppColors.questionMeta,
    fontFamily: AppFonts.black,
    fontSize: 14,
    textAlign: 'center',
  },
  others: {
    height: OTHERS_HEIGHT,
    lineHeight: OTHERS_HEIGHT,
    color: AppColors.questionMeta,
    fontFamily: AppFonts.bold,
    fontSize: 13,
    textAlign: 'center',
  },
});
