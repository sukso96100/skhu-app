import React, {Component} from 'react';
import {ScrollView, Text, View, ActivityIndicator} from 'react-native';
import {CardItem} from '../components/components';
import { MaterialIcons } from '@expo/vector-icons';
import {Linking} from 'expo';
import ForestApi from '../tools/apis';
import BuildConfigs from '../config';

export default class SyllabusDetails extends Component{
  static navigationOptions = ({ navigation, navigationOptions }) => {
    const { params } = navigation.state;

    return {
      title: '교수님별 시간표 조회 결과 확인',
    };
  };
  constructor(props){
    super(props);
    this.state = {
      subjectCode: this.props.navigation.getParam('subjectCode',''),
      classCode: this.props.navigation.getParam('classCode',''),
      semesterCode: this.props.navigation.getParam('semesterCode',''),
      year: this.props.navigation.getParam('year',''),
      details: undefined,
      isLoading: false
    };
  }
  componentDidMount(){

    this.loadSearchResults();
  }
  render(){
    if(this.state.isLoading){
      return(
        <View style={{justifyContent: 'center', padding: 32}}>
          <ActivityIndicator size="large" color={BuildConfigs.primaryColor} />
        </View>
      );
      }else{
        return(<View></View>);
      }
    }
  }

  async loadSearchResults(){
    try{
      this.setState({refreshing: true});
      const results = await ForestApi.postToSam('/SSE/SSEAD/SSEAD05_GetList',
        JSON.stringify({
          'Haggi': this.state.semesterCode,
          'HaggiNm': this.state.semester,
          'Yy': this.state.year,
          'GwamogParam': this.state.subject,
          'ProfParam': this.state.professor,
          'SosogParam': this.state.major
        }));
      let arr = [];
      if(results.ok){
        const data = await results.json();
        for(let item of data.DAT){
          arr.push({
            key: `${item.GwamogCd}-${item.Bunban}`,
            subjectCode: item.GwamogCd,
            classCode: item.Bunban,
            subject: item.GwamogKorNm,
            college: item.GaeseolDaehagNm,
            depart: item.GaeseolHagbuNm,
            major: item.GaeseolSosogNm,
            professor: item.ProfKorNm,
            professorNo: item.ProfNo,
            availablity: item.SueobGyehoegYn
          });
        }
        console.log(arr);
        this.setState({
          result: arr,
          refreshing: false,
          firstLoad: false
        });
      }
    }catch(err){
      console.log(err);
    }
  }
}


시간표 표시해주는 뷰분 긁어온것
render(){
  if(this.state.isLoading){
    return(
      <View style={{justifyContent: 'center', padding: 32}}>
        <ActivityIndicator size="large" color={BuildConfigs.primaryColor} />
      </View>
    );
  }else if(this.state.SchedulesProfs.length <= 0){
    return(
      <View style={{justifyContent: 'center', padding: 32}}>
        <Text>시간표를 불러오지 못했거나, 수강한 강의가 없어 표시할 시간표 데이터가 없습니다.</Text>
      </View>
    );
  }else{
    return(
      <ScrollView>
        <View style={{flex:1, flexDirection: 'row'}}>
          {this.state.timetable.map((item, i)=>{
            return(
              <View style={{flex: 1}}>
                <View style={{height: item.height, backgroundColor: 'white', padding: 2}}>
                  <Text style={{color: 'black'}}>{DateTools.dayOfWeekNumToStr(i)}</Text>
                </View>
                {this.state.timetable[i].map((item, j)=>{
                  let bgColor = item.isEmptyCell ? 'rgba(0, 0, 0, 0)' : 'silver';
                  if(item.isEmptyCell){
                    return(
                      <View style={{height: item.height, backgroundColor: bgColor, padding: 2}}
                        key={`item_${i}_${j}`}>
                      </View>
                    );
                  }else{
                    return(
                      <TouchableHighlight style={{}}
                        key={`item_${i}_${j}`} onPress={()=>{
                          this.props.navigation.navigate('SchedulesProfsDetails', {
                            subjectCode: item.syllabus.code.split('-')[0],
                            classCode: item.syllabus.code.split('-')[1],
                            semesterCode: item.syllabus.semester,
                            year: item.syllabus.year
                          });
                        }}>
                        <View style={{height: item.height, backgroundColor: bgColor, padding: 2}}>
                          <Text style={{color: 'black', fontSize: 12}}>{item.name}</Text>
                          <Text style={{color: 'black', fontSize: 8}}>{item.time}</Text>
                          <Text style={{color: 'black', fontSize: 8}}>{item.room}</Text>
                        </View>
                      </TouchableHighlight>
                    );
                  }
                })}
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
  }

}

async loadSchedulesProfs(){
  this.setState({isLoading: true});
  let result = await this.db.getSchedulesProfsData();
  let displayData = [];
  if(result){
    for(let i=0; i<result.length; i++){
      console.log(displayData);
      let item = result.item(i);
      console.log(item);
      let startsAtDatetime = {
        hour: moment(item.starts_at, 'HH:mm:ss').hours(),
        mins: moment(item.starts_at, 'HH:mm:ss').minutes()};
      let endsAtDatetime = {
        hour: moment(item.ends_at, 'HH:mm:ss').hours(),
        mins: moment(item.ends_at, 'HH:mm:ss').minutes()};
      let sevenMorning = {hour: 8, mins: 0};
      if(displayData[item.day]==undefined){
        console.log(`init ${item.day}`);
        displayData[item.day] = [];
        displayData[item.day].push({
          isEmptyCell: true,
          time: `08:00:00 ~ ${item.starts_at}`,
          endsAt: startsAtDatetime,
          name:'',
          room:'',
          height: (((startsAtDatetime.hour - sevenMorning.hour)*60)
              + (startsAtDatetime.mins - sevenMorning.mins))
        });
      }else{
        console.log(`add to ${item.day}`);
        let prevEndsAt = displayData[item.day][displayData[item.day].length-1].endsAt;
        displayData[item.day].push({
          isEmptyCell: true,
          time: `${prevEndsAt.hour}:${prevEndsAt.mins} ~ ${item.starts_at}`,
          endsAt: startsAtDatetime,
          name:'',
          room:'',
          height: (((startsAtDatetime.hour - prevEndsAt.hour)*60)
              + (startsAtDatetime.mins - prevEndsAt.mins))
        });
      }
      displayData[item.day].push({
        isEmptyCell: false,
        time: `${item.starts_at} ~ ${item.ends_at}`,
        endsAt: endsAtDatetime,
        name: item.title,
        room: item.room,
        height: (((endsAtDatetime.hour - startsAtDatetime.hour)*60)
            + (endsAtDatetime.mins - startsAtDatetime.mins)),
        syllabus:{
          code: item.lecture_id,
          semester: item.semester_code,
          year: item.year
        }
      });
    }
  }
  this.setState({
    timetable: displayData,
    isLoading: false
  });
}
}
