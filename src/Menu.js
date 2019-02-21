import React, { Component } from 'react';
import {
  Alert, Text, SafeAreaView, SectionList
} from 'react-native';
import { CardItem } from './components/components';
import NavigationService from './tools/NavigationService';
import {SecureStore, Linking} from 'expo';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import DBHelper from './tools/dbhelper';
import SnackBar from 'rn-snackbar';

export default class Menu extends Component {
static navigationOptions = ({ navigation, navigationOptions }) => {
  const { params } = navigation.state;

  return {
    title: '메뉴',
  };
};
render() {
  return(
    <SafeAreaView>
      <SectionList
        renderItem={({item, index, section}) => (
          <CardItem key={index} onPress={item.onPress} style={{flex: 0, flexDirection: 'row'}}>
            <MaterialCommunityIcons name={item.icon} size={16} style={{flex: 0, marginRight: 8}}/>
            <Text style={{flex: 1}}>{item.label}</Text>
          </CardItem>
        )}
        renderSectionHeader={({section: {title}}) => (
          <CardItem style={{flex: 0, flexDirection: 'row'}} isHeader={true}>
            <Text style={{fontWeight: 'bold'}}>{title}</Text>
          </CardItem>
        )}
        sections={[
          {title: '학교 생활', data: [
            {label: '나의 상담 이력', icon: 'comment-multiple-outline', onPress: ()=>{
              this.props.navigation.navigate('Counsel');
            }}
          ]},
          {title: '수강 관리', data: [
            {label: '강의계획서 조회', icon: 'clipboard-text', onPress: ()=>{
              this.props.navigation.navigate('Syllabus');
            }},
            {label: '학과/학부별 개설과목 조회', icon: 'format-list-bulleted' ,onPress: ()=>{
              this.props.navigation.navigate('Subjects');
            }},
            {label: '강의실별 시간표 조회', icon: 'format-list-bulleted' ,onPress: ()=>{
              this.props.navigation.navigate('LectureRooms');
            }},
            {label: '교수별 시간표 조회', icon: 'format-list-bulleted' ,onPress: ()=>{
              this.props.navigation.navigate('SchedulesProfs');
            }},
            {label: '학점세이브 조회', icon: 'archive', onPress: ()=>{
              this.props.navigation.navigate('SavedCredits');
            }},
            {label: '수강신청(외부링크 - sugang.skhu.ac.kr)', icon:'clipboard-check', onPress: ()=>{
              Linking.openURL('http://sugang.skhu.ac.kr/');
            }}
          ]},
          {title: '성적 및 장학 관리', data: [
            {label: '장학 내역 조회', icon: 'school' ,onPress: ()=>{
              this.props.navigation.navigate('ScholarshipHistory');
            }},
            {label: '학내 제출용 성적증명서', icon: 'certificate', onPress: ()=>{
              this.props.navigation.navigate('GradeCert');
            }}
          ]},
          {title: '관리', data: [
            {label: '앱 정보', icon: 'information', onPress: ()=>{
              this.props.navigation.navigate('About');
            }},
            {label: '로그아웃', icon:'logout', onPress: ()=>{
              Alert.alert(
                '로그아웃',
                '앱에서 로그아웃 하시겠습니까?',
                [
                  {text: '아니오', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                  {text: '예', onPress: async () => {
                    SnackBar.show('로그아웃 중입니다...', { duration: 1000, position: 'top', style: { paddingTop: 30 } });
                    await SecureStore.deleteItemAsync('userid');
                    await SecureStore.deleteItemAsync('userpw');
                    await SecureStore.deleteItemAsync('CredentialOld');
                    await SecureStore.deleteItemAsync('CredentialNew');
                    await SecureStore.deleteItemAsync('CredentialNewToken');
                    const db = new DBHelper();
                    await db.dropAllTables();
                    NavigationService.reset('Login', {loggedOut: true});
                  }},
                ],
                { cancelable: false }
              );
            }}
          ]},
        ]}
        keyExtractor={(item, index) => item + index}
      />
    </SafeAreaView>
  );
}
}
