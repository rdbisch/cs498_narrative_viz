/** Script to clean up data and prepare for Tableau dashboard
 * Rick Bischoff (rdb4@illinois.edu, rdbisch@gmail.com)
 * June 2020
 */
 
/* Create a derived field that represents 
 * the player's primary position */
DROP TABLE IF EXISTS temp_appear;
CREATE TABLE temp_appear AS 
SELECT yearID, teamID, lgID, playerID,
    G_all,
    CASE max_appear
        WHEN G_p THEN 'P'
        WHEN G_c THEN 'C'
        WHEN G_1b THEN '1B'
        WHEN G_2b THEN '2B'
        WHEN G_3b THEN '3B'
        WHEN G_ss THEN 'SS'
        WHEN G_lf THEN 'OF'
        WHEN G_rf THEN 'OF'
        WHEN G_cf THEN 'OF'
        WHEN G_dh THEN 'DH'
        ELSE '??'
    END AS primaryPosition
FROM (
SELECT yearID, teamID, lgID, playerID,
        G_all,
        G_p,
        G_c,
        G_1b,
        G_2b,
        G_3b,
        G_ss,
        G_lf,
        G_cf,
        G_rf,
        G_dh,
        MAX(G_p, G_c, G_1b, G_2b, G_3b, G_ss, G_lf, G_cf, G_rf, G_dh) AS max_appear
FROM appearances
);

/* Get rid of pitchers and primary pinch-hitters and runners */
SELECT COUNT(*) FROM temp_appear;
DELETE FROM temp_appear WHERE primaryPosition IN ('P', '??');
SELECT COUNT(*) FROM temp_appear;

/* Merge on salary */
DROP TABLE IF EXISTS temp_salary;
CREATE TABLE temp_salary AS
SELECT yearID, teamID, lgID, playerID, salary,
    PERCENT_RANK() OVER (
      PARTITION BY yearID
      ORDER BY Salary
    ) AS salaryRank
FROM salaries;

DROP TABLE IF EXISTS temp_t2;
CREATE TABLE temp_t2 AS
SELECT t1.*, t2.salary, t2.salaryRank
 FROM temp_appear t1, temp_salary t2
WHERE t1.yearID = t2.yearID
  AND t1.teamID = t2.teamID
  AND t1.lgID = t2.lgID
  AND t1.playerID = t2.playerID;

SELECT COUNT(*) FROM temp_t2;

/* Merge on batting info and create derived fields
 * 1B - # of singles
 * SLUG - Slugging average (# of bases on average hit)
 * OBP - On-base percentage
 */
DROP TABLE IF EXISTS temp_t3;
CREATE TABLE temp_t3 AS
SELECT t1.*,
    H + BB + SO + HBP + SH + SF AS PA,
    H - "2B" - "3B" - HR AS "1B",
    ((H - "2B" - "3B" - HR) + 2.0*"2B" + 3.0*"3B" + 4.0*HR) / CAST(AB AS float) AS SLUG,
    CAST((H + BB + HBP) AS float) / CAST((AB + BB + HBP + SF) AS float) AS OBP,
    t2.salary, t2.salaryRank, t2.G_all, t2.primaryPosition
  FROM batting t1, temp_t2 t2
WHERE t1.yearID = t2.yearID
  AND t1.teamID = t2.teamID
  AND t1.lgID = t2.lgID
  AND t1.playerID = t2.playerID;

SELECT COUNT(*) FROM temp_t3;

/* Get rid of players with only few at-bats */
DELETE FROM temp_t3 WHERE AB < 50;

SELECT COUNT(*) FROM temp_t3;

/* Merge on player name, debut, throwing and batting hand, and birth year */
DROP TABLE IF EXISTS temp_t4;
CREATE TABLE temp_t4 AS
SELECT t3.*, t4.nameFirst || " " || t4.nameLast AS name,
            t4.birthYear,
            t4.height,
            t4.weight,
            t4.bats,
            t4.throws,
            strftime('%Y', t4.debut) AS debutYear
  FROM temp_t3 t3, people t4
 WHERE t3.playerID = t4.playerID;

SELECT COUNT(*) FROM temp_t4;

/* Merge on team statistics */
DROP TABLE IF EXISTS temp_t5;
CREATE TABLE temp_t5 AS
SELECT t4.*, t4.yearID - debutYear as yearInLeague,
    t5.G AS team_G, t5.W AS team_W, t5.L AS team_L, t5.name AS teamName
  FROM temp_t4 AS t4, teams t5
 WHERE t4.lgID = t5.lgID
   AND t4.yearID = t5.yearID
   AND t4.teamID = t5.teamID;

SELECT COUNT(*) FROM temp_t5;

/* Clean up Team Names */
UPDATE temp_t5 SET TeamName = 'Phillies' WHERE teamID = 'PHI';
UPDATE temp_t5 SET TeamName = 'Pirates' WHERE teamID = 'PIT';
UPDATE temp_t5 SET teamName = 'Red Sox' WHERE teamID = 'BOS';
UPDATE temp_t5 SET teamNAme = 'Astros' WHERE teamID = 'HOU';
UPDATE temp_t5 SET teamName = 'Indians' WHERE teamID = 'CLE';
UPDATE temp_T5 SET teamName = 'Mets' WHERE teamID = 'NYN';
UPDATE temp_t5 SET teamNAme = 'Dodgers' WHERE teamID = 'LAN';
UPDATE temp_t5 SET teamName = 'White Sox' WHERE teamID = 'CHA';

UPDATE temp_t5 SET TeamName = 'Athletics' WHERE teamID = 'OAK';
UPDATE temp_t5 SET TeamName = 'Royals' WHERE teamID = 'KCA';
UPDATE temp_t5 SET teamName = 'Rangers' WHERE teamID = 'TEX';
UPDATE temp_t5 SET teamNAme = 'Blue Jays' WHERE teamID = 'TOR';
UPDATE temp_t5 SET teamName = 'Yankees' WHERE teamID = 'NYA';
UPDATE temp_T5 SET teamName = 'Reds' WHERE teamID = 'CIN';
UPDATE temp_t5 SET teamNAme = 'Braves' WHERE teamID = 'ATL';
UPDATE temp_t5 SET teamName = 'Angels' WHERE teamID IN ('CAL', 'LAA', 'ANA');

UPDATE temp_t5 SET TeamName = 'Tigers' WHERE teamID = 'DET';
UPDATE temp_t5 SET TeamName = 'Padres' WHERE teamID = 'SDN';
UPDATE temp_t5 SET teamName = 'Mariners' WHERE teamID = 'SEA';
UPDATE temp_t5 SET teamNAme = 'Cubs' WHERE teamID = 'CHN';
UPDATE temp_t5 SET teamName = 'Cardinals' WHERE teamID = 'SLN';
UPDATE temp_T5 SET teamName = 'Giants' WHERE teamID = 'SFN';
UPDATE temp_t5 SET teamNAme = 'Expos' WHERE teamID = 'MON';
UPDATE temp_t5 SET teamName = 'Twins' WHERE teamID = 'MIN';
UPDATE temp_t5 SET TeamName = 'Brewers' WHERE teamID IN ('ML4', 'MIL');
UPDATE temp_t5 SET TeamName = 'Orioles' WHERE teamID = 'BAL';
UPDATE temp_t5 SET teamName = 'Marlins' WHERE teamID IN ('FLO', 'MIA');
UPDATE temp_t5 SET teamNAme = 'Rockies' WHERE teamID = 'COL';
UPDATE temp_t5 SET teamName = 'Diamondbacks' WHERE teamID = 'ARI';
UPDATE temp_T5 SET teamName = 'Rays' WHERE teamID = 'TBA';
UPDATE temp_t5 SET teamNAme = 'Nationals' WHERE teamID = 'WAS';

/** Calcualte league averages for OBP and SLG for WAR calculation **/
DROP TABLE IF EXISTS temp_t6;
CREATE TABLE temp_t6 AS
SELECT t5.*, t6.avg_yr_lg_OBP, t6.avg_yr_lg_SLUG
  FROM temp_t5 t5, 
    (SELECT yearID, lgID, AVG(OBP) AS avg_yr_lg_OBP,
                            AVG(SLUG) AS avg_yr_lg_SLUG
        FROM temp_t5 
        GROUP BY yearID, lgID) t6

WHERE t5.lgID = t6.lgID 
  AND t5.yearID = t6.yearID;

SELECT COUNT(*) FROM temp_t6;

/* Create WAR calculation */
DROP TABLE IF EXISTS temp_t7;
CREATE TABLE temp_t7 AS
SELECT t6.*,
    ((OBP / avg_yr_lg_OBP) + (SLUG / avg_yr_lg_SLUG) - 1) * 100.0 AS OPS_PLUS
  FROM temp_t6 t6;
SELECT COUNT(*) FROM temp_t7;

DROP TABLE IF EXISTS temp_t8;
CREATE TABLE temp_t8 AS
SELECT t7.*,
  CASE 
    WHEN yearInLeague <= 3 THEN "1-3"
    WHEN yearInLeague >= 11 THEN "11+"
    ELSE CAST(yearInLeague AS text)
  END AS yearInLeagueGroup
  FROM temp_t7 t7;

SELECT COUNT(*) FROM temp_t8;

DROP TABLE IF EXISTS temp_t9;
CREATE TABLE temp_t9 AS
SELECT t8.*, maxYearsPlayed
  FROM temp_t8 t8,
  (SELECT playerID, MAX(yearInLeague) AS maxYearsPlayed FROM temp_t8
   GROUP BY playerID) t9
WHERE t8.playerID = t9.playerID;

SELECT COUNT(*) FROM temp_t9;