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
