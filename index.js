// ======================================================================================
// JSON Fetcher from osu! links
// ======================================================================================

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

// ======================================================================================
// ======================================================================================

// ======================================================================================
// Custom Sheets Function
// ======================================================================================

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
 * @customFunction
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
 * @customFunction
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
  return user_json["statistics"][info];
}

/**
 * Funtion to get match scores from mp link
 *
 * @param {string} match_link mp link
 * @return {Array} 2d array that can be printed on sheets.
 * Order as follows:
 * Beatmap ID
 * Player Name | Mods | Max Combo | Accurancy | Score
 * @customFunction
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

/**
 * Debug Function, to allow processing of raw match JSON
 * @param {string} json_inp
 * @customFunction
 */
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

// ======================================================================================
// ======================================================================================

// ======================================================================================
// Temporary Function
// ======================================================================================

/**
 * Get BZT S2 qualifiers score from mp_link. This function assumes that the referee did not make any mistake and there are no extra matches
 * @param {string} mp_link url of the multiplayer link
 * @param {string} bzt_set set this to "A" for Set A and "C" for set C
 * @param {string} referee [OPTIONAL] the name of the player to ignore when populating the scores
 * @customFunction
 */
function qualifiers(mp_link, bzt_set, referee = "") {
  let match_json = {};
  try {
    match_json = fetchMatchJson(mp_link);
    match_json = JSON.parse(match_json);
  } catch (e) {
    return "Invalid match link !";
  }

  let ref_uid = "";

  // Cross-match users
  let users = {};
  for (let i = 0; i < match_json["users"].length; i++) {
    users[match_json["users"][i].id] = {
      idx: i,
      name: match_json["users"][i].username,
    };
    if (match_json["users"][i].username == referee) {
      ref_uid = match_json["users"][i].id;
    }
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
          user_id: val.user_id,
          user_name: users[val.user_id].name,
          mods: val.mods,
          max_combo: val.max_combo,
          accurancy: val.accuracy,
          score: val.score,
        };
      }),
    });
  }

  const SET_A = {
    1100763: 1,
    2039004: 3,
    2233313: 5,
    1506487: 7,
    2135427: 9,
    1794942: 11,
    650249: 13,
    1535887: 15,
    2014148: 17,
    889235: 19,
  };

  const SET_C = {
    1055818: 1,
    281069: 3,
    2072692: 5,
    776594: 7,
    2179768: 9,
    116382: 11,
    1712791: 13,
    2619929: 15,
    1085199: 17,
    2414458: 19,
  };

  let set_arr = bzt_set == "A" ? SET_A : SET_C;

  // Prefill the array
  let ret_arr = [];

  let users_keys = Object.keys(users);
  for (let i = 0; i < users_keys.length; i++) {
    if (ref_uid != "" && users_keys[i] == ref_uid) {
      continue;
    }
    ret_arr[users[users_keys[i]].idx] = [users[users_keys[i]].name];
  }

  for (let i = 0; i < evt.length; i++) {
    let event_score = evt[i].scores;
    let bm_id = evt[i].beatmap_id;
    for (let j = 0; j < event_score.length; j++) {
      let score = event_score[j].score;
      let uid = event_score[j].user_id;
      // If the lobby includes map outside of mappool
      if (typeof set_arr[bm_id] !== "undefined") {
        if (ref_uid != "" && uid == ref_uid) {
          continue;
        }
        ret_arr[users[uid].idx][set_arr[bm_id]] = score;
      }
    }
  }

  // let user_keys = Object.keys(users);
  // // For each users
  // for (let i = 0; i < user_keys.length; i++) {
  // 	ret_arr[i][0] = users[user_keys[i]];

  // 	let bm_map_keys = Object.keys(set_arr);
  // 	for (let k = 0; k < bm_map_keys.length; k++) {
  // 		let found_score = null;
  // 		for (let j = 0; j < evt.length; j++) {
  // 			found_score = evt[j].scores.find((val) => {
  // 				return (
  // 					val.user_name == users[user_keys[i]] &&
  // 					evt[j].beatmap_id == set_arr[bm_map_keys[k]]
  // 				);
  //             });
  //             if(found_score) {
  //                 break;
  //             }
  // 		}
  // 		if (found_score) {
  // 			ret_arr[i][k * 2 + 1] = found_score.score;
  // 			ret_arr[i][k * 2 + 2] = "";
  // 		}
  // 	}
  // }
  return ret_arr;
}

/**
 * Temporary fuction to print the score of 2 players
 * @param {string} mp_link
 * @param {string} player1_name
 * @param {string} player2_name
 * @param {number} warmups_played [OPTIONAL] amount of warmup matches played before the real match
 * @param {boolean} ignore_warning [OPTIONAL] set this to true to skip matches that dont have the correct player
 * @customFunction
 */
function match1v1(
  mp_link,
  player1_name,
  player2_name,
  warmups_played = 0,
  ignore_warning = false
) {
  let match_json = {};
  try {
    match_json = fetchMatchJson(mp_link);
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

    // Remove events with no scores
    if (typeof val.game.scores !== "undefined" && val.game.scores.length == 0) {
      return false;
    }

    return true;
  });

  let p1_final_score = 0;
  let p2_final_score = 0;

  // Skip the warmup rounds
  for (let i = warmups_played; i < events_fil.length; i++) {
    let p1score;
    let p2score;

    p1score = events_fil[i].game.scores.find((val) => {
      return users[val.user_id] == player1_name;
    }).score;

    p2score = events_fil[i].game.scores.find((val) => {
      return users[val.user_id] == player2_name;
    }).score;

    if (!p1score || !p2score) {
      if (ignore_warning) continue;
      else
        return "One or more matches is missing one of the player, you can ignore this by setting last parmeter to true";
    }

    if (p1score > p2score) {
      p1_final_score++;
      continue;
    }
    if (p1score < p2score) {
      p2_final_score++;
      continue;
    }
  }

  return `${p1_final_score} - ${p2_final_score}`;
  // let final_fomula = `=HYPERLINK("${mp_link}","${p1_final_score} - ${p2_final_score}")`;

  // Get the current cell in text form, e.g. B4
  // let ss = SpreadsheetApp.getActiveSpreadsheet();
  // let sheet = ss.getSheets()[0];
  // let cell_range = sheet.getActiveCell();
  // let selectedColumn = cell_range.getColumn();
  // selectedColumn = String.fromCharCode("A".charCodeAt(0) + selectedColumn-1);
  // let selectedRow = cell_range.getRow();
  // let cell_in_text = selectedColumn + selectedRow;

  // let cell = sheet.getRange(cell_in_text);
  // cell.setFormula(final_fomula);
}

/**
 * Return formatted beatmap stat
 * @param {string} format use ${} for normal stat, use ${{}} for difficulty_specific. Refer to get_beatmap_info()
 * @param {string} bm_link url of the beatmap (with diff selected)
 * @return {string} formatted beatmap_stat
 * @example format: "${cs}|${ar}|${accuracy}|${drain}"
 * @customFunction
 */
function formatted_beatmap_stat(format, bm_link) {
  let beatmap_json = "";
  let map_id = "";
  try {
    beatmap_json = fetchBeatmapJson(bm_link);
    beatmap_json = JSON.parse(beatmap_json);
    map_id = parseInt(bm_link.slice(bm_link.indexOf("#osu/") + 5));
  } catch (e) {
    return "Invalid beatmap link !";
  }

  //   if (!difficulty_specifics) {
  //     if (info == "cover") {
  //       return beatmap_json["covers"]["cover@2x"];
  //     }
  //     return beatmap_json[info];
  //   }

  // Special case for normal stat
  if(format.includes("${cover}")) {
	  format = format.replace("${cover}", beatmap_json["covers"]["cover@2x"]);
  }

  // Check if there is any stat that matches
  let keys = Object.keys(beatmap_json);
  for (let i = 0; i < keys.length; i++) {
    format = format.replace(`\$\{${keys[i]}\}`, beatmap_json[keys[i]]);
  }

  // Find the specific difficulty
  let beatmap_obj = false;
  for (let i = 0; i < beatmap_json.beatmaps.length; i++) {
    if (beatmap_json.beatmaps[i].id == map_id) {
      beatmap_obj = beatmap_json.beatmaps[i];
      break;
    }
  }

  if (!beatmap_obj) {
    return "Invalid beatmap link ! (Failed to find difficulty)";
  }

  // Check if there is any difficulty stat that matches
  keys = Object.keys(beatmap_obj);
  for (let i = 0; i < keys.length; i++) {
    format = format.replace(`\$\{\{${keys[i]}\}\}`, beatmap_obj[keys[i]]);
  }

  return format;
}

// ======================================================================================
// ======================================================================================
