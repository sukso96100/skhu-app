import React, { Component } from 'react';
import {
  StyleSheet, Text, View,
  ScrollView, SafeAreaView, ActivityIndicator, FlatList, ListView
} from 'react-native';
import { CardView } from './components/components';
import { MaterialIcons } from '@expo/vector-icons';
import ForestApi from './tools/apis';
import { TopWidget } from './components/weather';
import BuildConfigs from './config';
import DateTools from './tools/datetools';
import DBHelper from './tools/dbhelper';
import FetchHelper from './tools/fetchHelper';
import SnackBar from 'rn-snackbar';
import { MaterialCommunityIcons } from '@expo/vector-icons';  //추가임포트


export default class Main extends Component {
  static navigationOptions = ({ navigation, navigationOptions }) => {
    const { params } = navigation.state;
    return {
      title: '홈',
      header: null // 헤더 비활성화
    };
  };
  constructor(props) {
    super(props);
    this.state = { url: '' };
    this.db = new DBHelper();
    this.db.fetchAttendance();
    this.db.fetchTimeTable();
    FetchHelper.fetchMealsUrl().then(url => this.setState({ url }));
  }
  render() {
    return (
      <SafeAreaView>
        <ScrollView>
          <View style={{ marginTop: 50, padding: 16 }}>
            <TopWidget />
            <CardView style={{ flex: 0, flexDirection: 'row' }}
              onPress={() => {
                this.props.navigation.navigate('Attendance');
              }} elevate={true}>
              <MaterialIcons name="check-circle" size={20} style={{ flex: 1 }} />
              <Text style={{ flex: 0 }}>나의 출결 현황</Text>
            </CardView>
            <CardView style={{ flex: 0, flexDirection: 'row' }} onPress={() => {
              this.props.navigation.navigate('Credits');
            }} elevate={true}>
              <MaterialIcons name="insert-chart" size={20} style={{ flex: 1 }} />
              <Text style={{ flex: 0 }}>현재 이수 학점</Text>
            </CardView>
            <Text style={{ fontSize: 20, marginTop: 16 }}>다음 강의</Text>
            <NextClassInfo dbHelper={this.db} onPress={() => {
              this.props.navigation.navigate('Timetable');
            }} />
            <Text style={{ fontSize: 20, marginTop: 16 }}>학사 일정</Text>
            <MonthlySchedule onPress={() => {
              this.props.navigation.navigate('Schedules');
            }} />
            <Text style={{ fontSize: 20, marginTop: 16 }}>공지사항</Text>
            <NoticeSchedule onPress={() => {
              this.props.navigation.navigate('NoticeScreen');
            }} />
            <Text style={{ fontSize: 20, marginTop: 16 }}>학식</Text>
            <Meal url={this.state.url} onPress={() => {
              this.props.navigation.navigate('Meal');
            }} />

          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

class NextClassInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      time: '',
      attendance: '',
      isLoading: false
    };
  }
  async componentDidMount() {
    try {
      this.setState({ isLoading: true });
      const data = await this.props.dbHelper.getNextClassInfo();
      if (data != undefined) {
        this.setState({
          name: data.title, time: `${DateTools.dayOfWeekNumToStr(data.day)} `
            + `${data.starts_at} ~ ${data.ends_at} @ ${data.room}`,
          attendance: `출석 ${data.attend}, 지각 ${data.late}, 결석 ${data.absence}, `
            + `공결 ${data.approved}, 생공 ${data.menstrual}, 조퇴 ${data.early}`,
          isLoading: false
        });
      } else {
        this.setState({ time: '다음 강의가 없습니다.', isLoading: false });
      }

    } catch (err) {
      this.setState({ time: '다음 강의 정보를 조회하지 못했습니다.', isLoading: false });
      console.log(err);

    }

  }
  render() {
    let content;
    if (this.state.isLoading) {
      content = (
        <View style={{ justifyContent: 'center', padding: 32 }}>
          <ActivityIndicator size="large" color={BuildConfigs.primaryColor} />
        </View>
      );
    } else {
      content = (
        <View>
          <Text style={{ fontSize: 25, fontWeight: 'bold' }}>{this.state.name}</Text>
          <Text style={{ fontSize: 20 }}>{this.state.time}</Text>
          <Text>{this.state.attendance}</Text>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ color: 'grey' }}>이번 학기 시간표 보기</Text>
            <MaterialIcons name="chevron-right" size={16} />
          </View>
        </View>
      );
    }
    return (
      <CardView onPress={this.props.onPress} elevate={true}>
        {content}
      </CardView>
    );
  }
}

class MonthlySchedule extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dates: '',
      contents: '',
      isLoading: false
    };
  }
  async componentDidMount() {
    this.setState({ isLoading: true });
    let today = new Date();
    let schedule = await ForestApi.post('/life/schedules', JSON.stringify({
      'year': today.getFullYear(),
      'month': today.getMonth() + 1
    }), false);
    if (schedule.ok) {
      let data = await schedule.json();
      let dates = '', contents = '';
      for (let item of data.schedules) {
        dates += `${item.period}\n`;
        contents += ` | ${item.content}\n`;
      }
      this.setState({
        dates: dates,
        contents: contents,
        isLoading: false
      });
    }
  }
  render() {
    let content;
    if (this.state.isLoading) {
      content = (
        <View style={{ justifyContent: 'center', padding: 32 }}>
          <ActivityIndicator size="large" color={BuildConfigs.primaryColor} />
        </View>
      );
    } else {
      content = (
        <View>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ flex: 0, fontWeight: 'bold' }}>{this.state.dates}</Text>
            <Text style={{ flex: 1 }}>{this.state.contents}</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ color: 'grey' }}>학사 일정 더 보기</Text>
            <MaterialIcons name="chevron-right" size={16} />
          </View>
        </View>
      );
    }
    return (
      <CardView onPress={this.props.onPress} elevate={true}>
        {content}
      </CardView>
    );
  }
}

class Meal extends Component {
  state = {
    meal: null,
    isLoading: true
  };

  componentDidMount() {
    FetchHelper.fetchMealsData(this.props.url).then(meals => {
      // TODO: 오늘 구하는 공식 들어가야함 일단은 첫번째 인덱스 배열 값 가져옴...

      let day = new Date().getDay(); //0 : 일요일,  1: 월요일...

      if (day == 0 || day == 5) //토욜이욜제외
        day = 4;
      else
        day -= 1;

      let meal = meals[day]; //0:월요일 1:화요일...

      this.setState({
        meal,
        isLoading: false
      });
    });
  }

  render() {
    let content;
    const { isLoading, meal } = this.state;
    if (isLoading) {
      content = (
        <View style={{ justifyContent: 'center', padding: 32 }}>
          <ActivityIndicator size="large" color={BuildConfigs.primaryColor} />
        </View>
      );
    }
    else {
      content = (
        <View>
          <View style={{ flexDirection: 'row' }}>
            <View>
              <Text style={{ fontWeight: 'bold' }}>오늘의 식단</Text>
            </View>
            <View>
              <Text>{meal.day}</Text>
              <Text style={{ fontWeight: 'bold' }}>점심</Text>
              <Text>{meal.lunch.a.diet}</Text>

              <Text style={{ fontWeight: 'bold' }}>일품</Text>
              <Text>{meal.lunch.b.diet}</Text>
              <Text style={{ fontWeight: 'bold' }}>저녁</Text>
              <Text>{meal.dinner.a.diet}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ color: 'grey' }}>주간 식단 보기</Text>
            <MaterialIcons name="chevron-right" size={16} />
          </View>
        </View>
      );
    }
    return (
      <CardView onPress={this.props.onPress} elevate={true}>
        {content}
      </CardView>
    );
  }
}

class NoticeSchedule extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      dataSource: []
    };
  }
  getData() {
    return fetch('http://15.164.16.2:8082/ping')
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({
          isLoading: false,
          dataSource: responseJson,
        });
      })
      .catch((error) => {
        console.error(error);
      });


  }

  async componentDidMount() {
    this.getData();

  }
  render() {

    if (this.state.isLoading) {
      content = (
        <View style={{ justifyContent: 'center', padding: 32 }}>
          <ActivityIndicator size="large" color={BuildConfigs.primaryColor} />
        </View>
      );
    } else {
      content = (
        <View>
          <View style={{ flexDirection: 'column' }}>

            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>제목</Text>
            <Text style={{marginBottom: 16}}>{this.state.dataSource.map(  //json값에서 조건으로 빼오기
              function (elem, index) {
                if (index == 0)
                  return elem.board_title;
              }
            )}
            </Text>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>날짜</Text>
            <Text style={{marginBottom: 16}}>{this.state.dataSource.map(  //json값에서 조건으로 빼오기
              function (elem, index) {
                if (index == 0)
                  return elem.board_insertdate;
              }
            )}
            </Text>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>내용</Text>
            <Text style={{marginBottom: 16}}>{this.state.dataSource.map(  //json값에서 조건으로 빼오기
              function (elem, index) {
                if (index == 0)
                  return elem.board_content;
              }
            )}
            </Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ color: 'grey' }}>공지사항 더 보기</Text>
            <MaterialIcons name="chevron-right" size={16} />
          </View>
        </View>
      );
    }
    return (
      <CardView onPress={this.props.onPress} elevate={true}>
        {content}

      </CardView>
    );
  }
}

