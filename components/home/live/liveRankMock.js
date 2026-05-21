const LIVE_RANK_CATEGORY_MAP = {
	hot: '热门',
	local: '同城',
	follow: '关注'
}

const LIVE_RANK_COLOR_POOL = [
	'linear-gradient(135deg, #ff8db2 0%, #ffb993 100%)',
	'linear-gradient(135deg, #74b6ff 0%, #92dbff 100%)',
	'linear-gradient(135deg, #7bdcc1 0%, #8ec6ff 100%)',
	'linear-gradient(135deg, #ffca7b 0%, #ffdca7 100%)',
	'linear-gradient(135deg, #a38dff 0%, #c1b0ff 100%)'
]

function buildRankUserList(categoryKey = 'hot') {
	const categoryLabel = LIVE_RANK_CATEGORY_MAP[categoryKey] || LIVE_RANK_CATEGORY_MAP.hot
	const namePool = ['Luna', 'Aria', 'Momo', 'Suri', 'Mila', 'Zoe', 'Iris', 'Nana', 'Ella', 'Cici']

	return namePool.map((name, index) => {
		const rank = index + 1
		return {
			id: `${categoryKey}-rank-user-${rank}`,
			rank,
			name,
			avatarText: name.slice(0, 2).toUpperCase(),
			avatarBackground: LIVE_RANK_COLOR_POOL[index % LIVE_RANK_COLOR_POOL.length],
			scoreText: `${(98 - index * 5).toFixed(1)}w 热度`,
			roomName: `${categoryLabel}直播间 ${rank}`
		}
	})
}

export function buildLiveHotRankCard(categoryKey = 'hot') {
	const topUser = buildRankUserList(categoryKey)[0]
	return {
		categoryKey,
		label: '实时热榜',
		name: topUser.name,
		avatarText: topUser.avatarText,
		avatarBackground: topUser.avatarBackground,
		actionText: '进入榜单'
	}
}

export function buildLiveRankPageMock(categoryKey = 'hot') {
	const categoryLabel = LIVE_RANK_CATEGORY_MAP[categoryKey] || LIVE_RANK_CATEGORY_MAP.hot
	return {
		categoryKey,
		title: `${categoryLabel}榜单`,
		subtitle: '实时热度排行',
		rankList: buildRankUserList(categoryKey)
	}
}

export function buildLiveRankPageUrl(categoryKey = 'hot') {
	return `/pages/live/rank?categoryKey=${encodeURIComponent(categoryKey)}`
}
