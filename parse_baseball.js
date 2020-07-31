/* Script to convert CSV baseball data into the right types for d3 */
function importLahman(row) {
    return {
        "id": row["ID"],
        "b_1B": +row['1B'],
        "b_2B": +row['2B'],
        "b_3B": +row['3B'],
        "AB": +row['AB'],
        "BB": +row["BB"],
        "CS": +row["CS"],
        "G": +row["G"],
        "GIDP": +row["GIDP"],
        "G_all": +row["G_all"],
        "H": +row["H"],
        "HBP": +row["HBP"],
        "OBP": +row["OBP"],
        "OPS_PLUS": +row["OPS_PLUS"],
        "PA": +row["PA"],
        "R": +row["R"],
        "RBI": +row["RBI"],
        "SB": +row["SB"],
        "SF": +row["SF"],
        "SH": +row["SH"],
        "SLUG": +row["SLUG"],
        "SO": +row["SO"],
        "avg_yr_lg_OBP": +row["avg_yr_lg_OBP"],
        "avg_yr_lg_SLUG": +row["avg_yr_lg_SLUG"],
        "bats": row["bats"],
        "birthYear": +row["birthYear"],
        "debutYear": +row["debutYear"],
        "height": +row["height"],
        "lgID": row["lgID"],
        "maxYearsPlayed": +row["maxYearsPlayed"],
        "name": row["name"],
        "primaryPosition": row["primaryPosition"],
        "salary": +row["salary"],
        "teamID": row["teamID"],
        "teamName": row["teamName"],
        "team_G": +row["team_G"],
        "team_ID": row["team_ID"],
        "team_L": +row["team_L"],
        "team_W": +row["team_W"],
        "throws": row["throws"],
        "weight": +row["weight"],
        "year": +row["yearID"]
    };
}

function sumBaseballSalary(year) {
    var result = 0;
    baseball_data.forEach(el => {
        if (el.year == year) { result += el.salary; }
    });
    return result;
}

function createAggBaseball() {
    /* We want this array to look like this 
        *
        result
            years: [array/set of years]
            teams: [array/set of team idx]
            team_dict: [{ idx: integer,  name: name } array/set of teams]
            OPS_PLUS:
                [array of objects that look like 
                    {year:
                        stat: [ array aligned to team. e.g. stat[i] corresponds to team with idx i ] }
                    ]
    */
   var result = {
        years: [],
        teams: [],
        team_dict: {},
        OPS_PLUS: {},
        salary: {},
        AB: {},
        ops_per_dollar: {},
        best: {},
        rookie: {}
    }
    var t_y = {}
    var t_t = {}
    var nextID = 0;
    baseball_data.forEach((el, idx) => {
        if (!(el.year in t_y)) t_y[el.year] = 0;
        if (!(el.teamName in t_t)) {
            t_t[el.teamName] = {
                idx: nextID,
                id: el.teamName,
                name: el.teamName
            }
            nextID++;
        }
    });
    result.years = Object.keys(t_y);
    for (var i = 0; i < nextID; ++i) result.teams.push(i);

    path = "data/icons/";
    t_t["Angels"].icon = path + "laa.gif";
    t_t["Astros"].icon = path + "houston.gif";
    t_t["Athletics"].icon = path + "oakland.gif";
    t_t["Blue Jays"].icon = path + "toronto.gif";
    t_t["Braves"].icon = path + "atlanta.gif";
    t_t["Brewers"].icon = path + "milwaukee.gif";
    t_t["Cardinals"].icon = path + "stlouis.gif";
    t_t["Cubs"].icon = path + "chicago.gif";
    t_t["Diamondbacks"].icon = path + "arizona.gif";
    t_t["Dodgers"].icon = path + "lad.gif";
    t_t["Expos"].icon = path + "montreal.gif";;
    t_t["Giants"].icon = path + "sanfrancisco.gif";
    t_t["Indians"].icon = path + "cleveland.gif";
    t_t["Mariners"].icon = path + "seattle.gif";
    t_t["Marlins"].icon = path + "miami.gif";
    t_t["Mets"].icon = path + "nym.gif";
    t_t["Nationals"].icon = path + "washington.gif";
    t_t["Orioles"].icon = path + "baltimore.gif";
    t_t["Padres"].icon = path + "sandiego.gif";
    t_t["Phillies"].icon = path + "philadelphia.gif";
    t_t["Pirates"].icon = path + "pittsburgh.gif";
    t_t["Rangers"].icon = path + "texas.gif";
    t_t["Rays"].icon = path + "tampabay.gif";
    t_t["Red Sox"].icon = path + "boston.gif";
    t_t["Reds"].icon = path + "cincinnati.gif";
    t_t["Rockies"].icon = path + "colorado.gif";
    t_t["Royals"].icon = path + "kc.gif";
    t_t["Tigers"].icon = path + "detroit.gif";
    t_t["Twins"].icon = path + "minnesota.gif";
    t_t["White Sox"].icon = path + "chicago_sox.gif";
    t_t["Yankees"].icon = path + "nyy.gif";

    result.team_dict = t_t;

    baseball_data.forEach((el, idx) => {
        if (!(el.teamName in result.OPS_PLUS)) {
            result.OPS_PLUS[el.teamName] = {};
            result.salary[el.teamName] = {};
            result.ops_per_dollar[el.teamName] = {};
            result.AB[el.teamName] = {};
            result.best[el.teamName] = {}
            result.rookie[el.teamName] = {}
        }
        if (!(el.year in result.OPS_PLUS[el.teamName])) {
            result.OPS_PLUS[el.teamName][el.year] = 0;
            result.salary[el.teamName][el.year] = 0;
            result.AB[el.teamName][el.year] = 0;
            result.best[el.teamName][el.year] = {};
        }

        var yearsInLeague = el.year - el.debutYear;
        if (yearsInLeague >= 10) yearsInLeague = 10;
        else yearsInLeague = yearsInLeague;

        if (!(yearsInLeague in result.rookie[el.teamName])) {
            result.rookie[el.teamName][yearsInLeague] = {
                AB: 0,
                ops_plus_ab: 0,
                salary: 0
            }
        }

        if (el.year >= 2010) {
            var tt = result.rookie[el.teamName][yearsInLeague];
            tt.ops_plus_ab = (tt.ops_plus_ab * tt.AB) + (el.OPS_PLUS*el.AB);
            tt.AB += el.AB;
            tt.ops_plus_ab = tt.ops_plus_ab / tt.AB;
            tt.salary += el.salary;
            result.rookie[el.teamName][yearsInLeague] = tt; 
        }

        var t = result.best[el.teamName][el.year];
        if (Object.keys(t).length == 0 ||
            el.AB * el.OPS_PLUS > t.ops_plus_ab) {
            t.ops_plus = el.OPS_PLUS;
            t.ops_plus_ab = el.AB * el.OPS_PLUS;
            t.salary = el.salary;
            t.name = el.name;
            t.AB = el.AB;
            t.debutYear = el.debutYear;
            t.salary = el.salary;
            t.team = el.teamName;
            result.best[el.teamName][+el.year] = t;
        }
        result.OPS_PLUS[el.teamName][+el.year] += el.AB * el.OPS_PLUS;
        result.salary[el.teamName][+el.year] += el.salary;
        result.AB[el.teamName][+el.year] += el.AB;

    });

    for ( const team of Object.keys(result.team_dict)) {
        for ( const year of result.years) {
            result.OPS_PLUS[team][year] = result.OPS_PLUS[team][year] / result.AB[team][year];
            result.ops_per_dollar[team][year] =
                1000000 * result.OPS_PLUS[team][year] / result.salary[team][year];
        }
    }

    /* OPS_PLUS[team] now contains an array like this:
        { year: value  } etc.
        We are going to change it so that instead:
        OPS_PLUS[team] = [
            {year: year, value: value}
        ]
    */
    function helper(r) {
        var replacement = {}
        min_v = null;
        max_v = null;

        for (const [key, value] of Object.entries(result[r])) {
            restate = []
            for (const [key1, value1] of Object.entries(value)) {
                restate.push(
                    {
                        year: key1,
                        value: value1
                    }
                )
                if (!min_v || value1 < min_v) min_v = value1;
                if (!max_v || value1 > max_v) max_v = value1;
            }
            replacement[key] = restate;
        }
        return {
            replacement: replacement,
            extent: [min_v, max_v]
        }
    }
    var t = helper("OPS_PLUS");
    result.OPS_PLUS = t.replacement;
    result.OPS_PLUS_extent = t.extent;
    t = helper("salary");
    result.salary = t.replacement;
    result.salary_extent = t.extent;
    t = helper("ops_per_dollar");
    result.ops_per_dollar = t.replacement;
    result.ops_per_dollar_extent = t.extent;
    return result;
}

function quickRegression(data, xfield, yfield) {
    var x = 0;
    var y = 0;
    var xx = 0;
    var xy = 0;
    var n = 0;
    var minx = null;
    var maxx = null;
    var first = true;

    for (const el of data) {
        var tx = +el[xfield];
        var ty = +el[yfield];
        if (first) {
            minx = tx;
            maxx = tx;
            first = false;
        }
        if (tx < minx) minx = tx;
        if (tx > maxx) maxx = tx;
        x += tx;
        y += ty;
        xx += tx * tx;
        xy += tx * ty;
        n += 1;
    }

    var slope = (xy - x*y/n) / xx;
    var intercept = (y - slope*x) / n;

    function L(tx) { return (intercept + slope*tx); }
    return [{x: minx, y: L(minx)}, {x: maxx, y: L(maxx)}]
}