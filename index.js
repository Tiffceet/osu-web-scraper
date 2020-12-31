function fetchBeatmapJson(bm_link) {
	let response = UrlFetchApp.fetch(bm_link);

	response = response.getContentText();
	response = response.slice(response.indexOf('<script id="json-beatmapset"'));
	response = response.slice(
		response.indexOf("{"),
		response.indexOf("</script>")
	);
	response = response.replace(/\\\//g, "/");

	return response;
}

function fetchUserJson(usr_link) {
	let response = UrlFetchApp.fetch(usr_link);

	response = response.getContentText();
	response = response.slice(response.indexOf('<script id="json-user"'));
	response = response.slice(
		response.indexOf("{"),
		response.indexOf("</script>")
	);
	response = response.replace(/\\\//g, "/");

	return response;
}

function fetchMatchJson(match_link) {
	let response = UrlFetchApp.fetch(match_link);

	response = response.getContentText();
	response = response.slice(response.indexOf('<script id="json-events"'));
	response = response.slice(
		response.indexOf("{"),
		response.indexOf("</script>")
	);
	response = response.replace(/\\\//g, "/");

	return response;
}

/**
 * Get beatmap info
 *
 * @param {string} info can be any of the following:
 * Beatmap Specfics:
 * "artist"             - artist name
 * "artist_unicode"     - artist name in natives
 * "cover"              - get the url to the image cover of this map
 * "creator"            - map creator
 * "favourite_count"    - how many times this beatmap is being favorited
 * "id"                 - beatmap id
 * "play_count"         - play count of this map
 * "preview_url"        - url to music preview
 * "source"             - i have no idea
 * "status"             - status of this map
 * "title"              - Title of this map
 * "title_unicode"      - Title of this map in natives
 * "user_id"            - user id of the map creator
 * "video"              - does this map have video?
 * "bpm"                - bpm of this map
 * "can_be_hyped"       - can this beatmap be hyped?
 * "discussion_enabled" - is the disscussion of this map enabled?
 * "discussion_locked"  - is the disccusion of this map locked?
 * "is_scoreable"       - i have no idea
 * "last_updated"       - map last updated
 * "legacy_thread_url"  - i have no idea
 * "ranked"             - i have no idea
 * "ranked_date"        - date ranked of this map
 * "storyboard"         - do this map have story board
 * "submitted_date"     - when was this submitted ?
 * "tags"               - beatmap_tags
 * Difficulty Specifics:
 * "difficulty_rating"  - Star rating
 * "id"                 - Difficulty ID
 * "mode"               - Mode of this difficulty
 * "version"            - Difficulty name
 * "accuracy"           - OD of the map
 * "ar"                 - AR of the map
 * "beatmapset_id"      - map ID of this diff
 * "bpm"                - BPM of the map
 * "convert"            - is this converted map?
 * "count_circles"      - Circle counts of the map
 * "count_sliders"      - Slider counts of the map
 * "count_spinners"     - Spinner counts of the map
 * "cs"                 - CS of the map
 * "deleted_at"         - when was this diff deleted
 * "drain"              - HP of the map
 * "hit_length"         - i have no idea
 * "is_scoreable"       - i have no idea
 * "last_updated"       - when was this map updated last
 * "mode_int"           - integer of the mode of this diff (0 for osu!std)
 * "passcount"          - How many passes on this diff
 * "playcount"          - How many plays on this diff
 * "ranked"             - i have no idea
 * "status"             - status of the map
 * "total_length"       - length of map in seconds
 * "url"                - url of the map
 * @param {string} bm_link url of the beatmap (with diff selected)
 * @param {boolean} difficulty_specifics set this to true if you want info from difficulty specifics
 * @return {string} beatmap info requested
 */
function get_beatmap_info(info, bm_link, difficulty_specifics = false) {
	let beatmap_json = "";
	let map_id = "";
	try {
		beatmap_json = fetchBeatmapJson(bm_link);
		beatmap_json = JSON.parse(beatmap_json);
		map_id = parseInt(bm_link.slice(bm_link.indexOf("#osu/") + 5));
	} catch (e) {
		return "Invalid beatmap link !";
	}

	if (!difficulty_specifics) {
		if (info == "cover") {
			return beatmap_json["covers"]["cover@2x"];
		}
		return beatmap_json[info];
	}

	let beatmap_obj = false;

	for (let i = 0; i < beatmap_json.beatmaps.length; i++) {
		if (beatmap_json.beatmaps[i].id == map_id) {
			beatmap_obj = beatmap_json.beatmaps[i];
			break;
		}
	}

	if (!beatmap_obj) {
		return "Invalid beatmap link !";
	}

	return beatmap_obj[info];
}

/**
 * Get osu! user info
 * @param {string} info Info you wish to fetch, can be any of the following
 * User Specifics:
 * "avatar_url"                 - get url to the pfp of this user
 * "country_code"               - country code of this user
 * "default_group"              - i have no idea
 * "id"                         - user id
 * "is_active"                  - is this user still active?
 * "is_bot"                     - is this user a bot?
 * "is_online"                  - is this user currently online?
 * "is_supporter"               - is this user a supporter?
 * "last_visit"                 - user's last time opened osu!
 * "username"                   - self-explanatory
 * "cover_url"                  - url to profile page cover image if any
 * Statistics Specifics:
 * "pp"                         - self-explanatory
 * "ranked_score"               - self-explanatory
 * "hit_accuracy"               - Accurancy of the user
 * "play_count"                 - self-explanatory
 * "play_time"                  - self-explanatory
 * "total_score"                - self-explanatory
 * "total_hits"                 - self-explanatory
 * "maximum_combo"              - self-explanatory
 * "replays_watched_by_others"  - self-explanatory
 * "is_ranked"                  - is the user ranked?
 * "global_rank"                - global rank of the user
 * "country_rank"               - country rank of the user
 * @param {string} usr_link
 * @param {boolean} get_statistics_specifics set this to true if you wish to get info from statistics specifics
 * @param {string} mode osu!mode to pull data from (osu, taiko, ctb, mania)
 * @return {string} infomation of the player
 */
function get_user_info(
	info,
	usr_link,
	get_statistics_specifics = false,
	mode = "osu"
) {
	let user_json = "";
	try {
		user_json = fetchUserJson(usr_link + "/" + mode);
		user_json = JSON.parse(user_json);
	} catch (e) {
		return "Invalid user link !";
	}

	if (!get_statistics_specifics) {
		return user_json[info];
	}
	if (info == "global_rank") {
		return user_json["statistics"]["rank"]["global"];
	}
	if (info == "country_rank") {
		return user_json["statistics"]["rank"]["country"];
	}

	return user_json[info];
}

/**
 * Funtion to get match scores from mp link
 *
 * @param {string} match_link mp link
 * @return {Array} 2d array that can be printed on sheets.
 * Order as follows:
 * Beatmap ID
 * Player Name | Mods | Max Combo | Accurancy | Score
 */
function get_match_scores(match_link) {
	// let match_link = "https://osu.ppy.sh/community/matches/70533573";
	let match_json = {};
	try {
		match_json = fetchMatchJson(match_link);
		match_json = JSON.parse(match_json);
	} catch (e) {
		return "Invalid match link !";
	}

	// Cross-match users
	let users = {};
	for (let i = 0; i < match_json["users"].length; i++) {
		users[match_json["users"][i].id] = match_json["users"][i].username;
	}

	let events_fil = match_json["events"].filter((val, idx, self) => {
		if (typeof val.detail.type === "undefined") {
			return false;
		}

		if (val.detail.type != "other") {
			return false;
		}

		if (typeof val.game === "undefined") {
			return false;
		}
		return true;
	});

	let evt = [];

	for (let i = 0; i < events_fil.length; i++) {
		evt.push({
			beatmap_id: events_fil[i].game.beatmap.id,
			scores: events_fil[i].game.scores.map((val) => {
				return {
					user_name: users[val.user_id],
					mods: val.mods,
					max_combo: val.max_combo,
					accurancy: val.accuracy,
					score: val.score,
				};
			}),
		});
	}

	let ret_arr = [];

	for (let i = 0; i < evt.length; i++) {
		ret_arr.push([evt[i].beatmap_id]);
		for (let j = 0; j < evt[i].scores.length; j++) {
			ret_arr.push([
				evt[i].scores[j].user_name,
				evt[i].scores[j].mods.join(" "),
				evt[i].scores[j].max_combo,
				evt[i].scores[j].accurancy,
				evt[i].scores[j].score,
			]);
		}
	}

	return ret_arr;
}

function get_match_scores_json_mode(json_inp) {
	// let match_link = "https://osu.ppy.sh/community/matches/70533573";
	let match_json = JSON.parse(json_inp);

	// Cross-match users
	let users = {};
	for (let i = 0; i < match_json["users"].length; i++) {
		users[match_json["users"][i].id] = match_json["users"][i].username;
	}

	let events_fil = match_json["events"].filter((val, idx, self) => {
		if (typeof val.detail.type === "undefined") {
			return false;
		}

		if (val.detail.type != "other") {
			return false;
		}

		if (typeof val.game === "undefined") {
			return false;
		}
		return true;
	});

	let evt = [];

	for (let i = 0; i < events_fil.length; i++) {
		evt.push({
			beatmap_id: events_fil[i].game.beatmap.id,
			scores: events_fil[i].game.scores.map((val) => {
				return {
					user_name: users[val.user_id],
					mods: val.mods,
					max_combo: val.max_combo,
					accurancy: val.accuracy,
					score: val.score,
				};
			}),
		});
	}

	let ret_arr = [];

	for (let i = 0; i < evt.length; i++) {
		ret_arr.push([evt[i].beatmap_id]);
		for (let j = 0; j < evt[i].scores.length; j++) {
			ret_arr.push([
				evt[i].scores[j].user_name,
				evt[i].scores[j].mods.join(" "),
				evt[i].scores[j].max_combo,
				evt[i].scores[j].accurancy,
				evt[i].scores[j].score,
			]);
		}
	}

	return ret_arr;
}
