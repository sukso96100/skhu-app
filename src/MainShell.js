import React, { Component } from 'react';
import { Text, View, StatusBar, Platform } from 'react-native';
import { createBottomTabNavigator, createStackNavigator } from 'react-navigation';
import Touchable from './components/touchable';
import Main from './Main';
import Menu from './Menu';
import AttendanceScreen from './screens/attendance';
import Schedules from './screens/schedules';
import Credits from './screens/credits';
import Timetable from './screens/timetable';
import CounselHistory from './screens/counsel';
import Syllabus from './screens/syllabus';
import SyllabusDetails from './screens/syllabusDetails';
import SavedCredits from './screens/savedCredits';
import ScholarshipHistory from './screens/scholarshopHistory';
import GradeCert from './screens/gradeCert';
import Subjects from './screens/subjects';
import About from './screens/about';
import Meal from './screens/meal';
import { MaterialIcons } from '@expo/vector-icons';
import BuildConfigs from './config';
import NoticeScreen from './screens/notice';
import LectureRooms from './screens/lectureRooms';
import SchedulesProfs from './screens/schedulesProfs';

const HomeStack = createStackNavigator(
  {
    Home: Main,
    Attendance: AttendanceScreen,
    Schedules: Schedules,
    Credits: Credits,
    Timetable: Timetable,
    SyllabusDetails: SyllabusDetails,
    Meal: Meal,
    NoticeScreen :NoticeScreen,
  },
  {
    initialRouteName: 'Home',
    navigationOptions: {
      headerTintColor: '#569f59',
      headerTitleStyle: {
        fontWeight: 'bold',
        color: 'black'
      },
    },
  }
);

const MenuStack = createStackNavigator(
  {
    Menu: Menu,
    Counsel: CounselHistory,
    Syllabus: Syllabus,
    SyllabusDetails: SyllabusDetails,
    SavedCredits: SavedCredits,
    ScholarshipHistory: ScholarshipHistory,
    GradeCert: GradeCert,
    Subjects: Subjects,
    About: About,
    LectureRooms: LectureRooms,
    SchedulesProfs: SchedulesProfs,
  },
  {
    initialRouteName: 'Menu',
    navigationOptions: {
      headerTintColor: BuildConfigs.primaryColor,
      headerTitleStyle: {
        fontWeight: 'bold',
        color: 'black'
      },
    },
  }
);

const TabNavigator = createBottomTabNavigator(
  {
    Home: HomeStack,
    Menu: MenuStack,
  },
  {
    navigationOptions: ({ navigation }) => ({
      tabBarButtonComponent: Touchable,
      tabBarIcon: ({ focused, tintColor }) => {
        const { routeName } = navigation.state;
        let iconName, label;
        switch(routeName){
        case 'Home': iconName = 'home'; label = '홈'; break;
        case 'Menu': iconName = 'menu'; label = '메뉴'; break;
        }
        // You can return any component that you like here! We usually use an
        // icon component from react-native-vector-icons
        return (
          <View>
            <MaterialIcons name={iconName} size={25} color={tintColor} />
            <Text style={{color: tintColor, textAlign: 'center'}}>{label}</Text>
          </View>
        );
      },
    }),
    tabBarOptions: {
      activeTintColor: '#569f59',
      inactiveTintColor: 'gray',
      showLabel: false
    },
  }
);

export default class MainShell extends Component {
    static navigationOptions = ({ navigation, navigationOptions }) => {
      const { params } = navigation.state;

      return {
        header: null // 헤더 비활성화
      };
    };
    render() {
      return <TabNavigator/>;
    }
    componentDidMount(){
      if(Platform.OS == 'ios') StatusBar.setBarStyle({barStyle: 'light-content'});
    }
}
