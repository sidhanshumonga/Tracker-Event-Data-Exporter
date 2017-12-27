/**
 * Created by harsh on 2/12/16.
 */

    const Anonymous_Attribute_Code = "Anonymous?";
const SQLQUERY_TEI_ATTR = "select tei.uid tei ,min(tea.name) attrname,tea.uid attruid,min(teav.value) attrvalue,ou.name,tei.created,pi.enrollmentdate enrolldate\
 from programstageinstance psi\
 INNER JOIN programinstance pi ON  psi.programinstanceid = pi.programinstanceid\
 INNER JOIN trackedentityinstance tei ON  pi.trackedentityinstanceid = tei.trackedentityinstanceid\
 INNER JOIN trackedentityattributevalue teav ON  teav.trackedentityinstanceid = pi.trackedentityinstanceid\
 INNER JOIN trackedentityattribute  tea ON teav.trackedentityattributeid = tea.trackedentityattributeid\
 INNER JOIN programstage ps ON ps.programstageid = psi.programstageid\
 INNER JOIN organisationunit ou ON ou.organisationunitid = psi.organisationunitid\
 WHERE psi.programstageid IN (select programstageid from programstage\
 where programid IN (select programid\
 from program\
 where uid = '${program}'))\
 and psi.organisationunitid IN (select organisationunitid\
 from organisationunit\
 where path like '%${orgunit}%')\
 and pi.enrollmentdate between '${startdate}' and '${enddate}'\
 group by tei.uid,pi.enrollmentdate,tea.uid,ou.name,tei.created\
 order by pi.enrollmentdate,tei.uid";

const SQLQUERY_TEI_ATTR_NAME = "TRACKER_REPORTS_TEI_ATTR_V1";

const SQLQUERY_TEI_DATA_VALUE = "select tei.uid tei,ps.uid psuid,min(ps.name) psname,psi.uid ev ,psi.executiondate evdate,de.uid deuid,min(de.name) dename,min(tedv.value) devalue,ou.name, pi.enrollmentdate enrollDate\
 from programstageinstance psi\
 INNER JOIN programinstance pi ON  psi.programinstanceid = pi.programinstanceid\
 INNER JOIN trackedentityinstance tei ON  pi.trackedentityinstanceid = tei.trackedentityinstanceid\
 INNER JOIN trackedentitydatavalue tedv ON tedv.programstageinstanceid = psi.programstageinstanceid\
 INNER JOIN dataelement de ON de.dataelementid = tedv.dataelementid\
 INNER JOIN programstage ps ON ps.programstageid = psi.programstageid\
 INNER JOIN organisationunit ou ON ou.organisationunitid = psi.organisationunitid\
 WHERE psi.programstageid IN (select programstageid from programstage\
 where programid IN (select programid\
 from program\
 where uid = '${program}'))\
 and psi.organisationunitid IN (select organisationunitid\
 from organisationunit\
 where path like '%${orgunit}%')\
 and pi.enrollmentdate between '${startdate}' and '${enddate}'\
 group by tei.uid,ps.uid,psi.uid,psi.executiondate,de.uid,ou.name, pi.enrollmentdate\
 order by pi.enrollmentdate,tei.uid,psi.executiondate";

const SQLQUERY_TEI_DATA_VALUE_NAME = "SQLQUERY_TEI_DATA_VALUE_V1";

const SQLQUERY_EVENT= "select ps.uid psuid,min(ps.name) psname,psi.uid ev ,psi.executiondate evdate,de.uid deuid,min(de.name) dename,min(tedv.value) devalue,ou.name, psi.executiondate::DATE\
 from programstageinstance psi\
 INNER JOIN programinstance pi ON  psi.programinstanceid = pi.programinstanceid\
 INNER JOIN trackedentitydatavalue tedv ON tedv.programstageinstanceid = psi.programstageinstanceid\
 INNER JOIN dataelement de ON de.dataelementid = tedv.dataelementid\
 INNER JOIN programstage ps ON ps.programstageid = psi.programstageid\
 INNER JOIN organisationunit ou ON ou.organisationunitid = psi.organisationunitid\
 WHERE psi.programstageid IN (select programstageid from programstage\
 where programid IN (select programid\
 from program\
 where uid = '${program}'))\
 and psi.organisationunitid IN (select organisationunitid\
 from organisationunit\
 where path like '%${orgunit}%')\
 and psi.executiondate between '${startdate}' and '${enddate}'\
 group by ps.uid,psi.uid,psi.executiondate,de.uid,ou.name, psi.executiondate\
 order by psi.executiondate";

const SQLQUERY_EVENT_NAME = "SQLQUERY_EVENT_V1";

const SQLView_Init = [
    {
        name : SQLQUERY_TEI_ATTR_NAME,
        query :SQLQUERY_TEI_ATTR,
        desc : "",
        type : "QUERY"
    },
    {
        name : SQLQUERY_TEI_DATA_VALUE_NAME,
        query :SQLQUERY_TEI_DATA_VALUE,
        desc : "",
        type : "QUERY"
    },
    {
        name : SQLQUERY_EVENT_NAME,
        query :SQLQUERY_EVENT,
        desc : "",
        type : "QUERY"
    }
];

const SQLView_Init_Map = prepareIdToObjectMap(SQLView_Init,"name");

