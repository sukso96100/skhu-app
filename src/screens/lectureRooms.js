import React, { Component } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import {
    View, FlatList, Text, ActivityIndicator, StyleSheet,
    ScrollView, SafeAreaView, Button, Image, TouchableOpacity, RefreshControl, Modal, TextInput, Picker, SectionList
} from 'react-native';
import { CardView, CardItem, BottomModal } from '../components/components';
import { MaterialHeaderButtons } from '../components/headerButtons';
import BuildConfigs from '../config';
import DateTools from '../tools/datetools';
import ForestApi from '../tools/apis';
import moment from 'moment';

export default class SchedulesProfs extends Component{
  static navigationOptions = ({ navigation, navigationOptions }) => {
    const { params } = navigation.state;

    return {
      title: '강의실 시간표 조회',
    };
  };

  constructor(props){
    super(props);
    const today = new Date();
    const semester = DateTools.getSemesterCode(today.getMonth()+1);
    this.state = {
      showSearchModal: false,
      year: today.getFullYear().toString(),
      semester: semester.name,
      semesterCode: semester.code,
      subject: '',
      major: '',
      professor:'',
      result: [],
      refreshing: false,
      firstLoad: true
    };
  }
  componentDidMount(){
    this.loadSearchResults();
  }

  render() {
      if (this.state.firstLoad) {
          return (
              <View style={{ justifyContent: 'center', padding: 32 }}>
                  <ActivityIndicator size="large" color={BuildConfigs.primaryColor} />
              </View>
          );
      } else {
          return (
              <View>
                  <CardItem style={{}} onPress={() => this.setState({ showSearchModal: true })}
                      style={{ flex: 0, flexDirection: 'row' }} elevate={true}>
                      <Text style={{ flex: 1 }}>
                          {this.state.title} / {this.state.date}
                      </Text>
                      <MaterialIcons name="search" size={20} style={{ flex: 0 }} />
                  </CardItem>


                  {/* 검색창 */}
                  <BottomModal
                      title='공지사항 검색'
                      visible={this.state.showSearchModal}
                      onRequestClose={() => this.setState({ showSearchModal: false })}
                      buttons={[
                          {
                              label: '취소', onPress: () => {
                                  this.setState({ showSearchModal: false });
                              }
                          },
                          {
                              label: '검색', onPress: () => {
                                  this.setState({ showSearchModal: false });
                                  this.loadSearchResults();
                              }
                          }
                      ]}>
                      <CardItem>
                        <TextInput placeholder={'년도(필수)'} defaultValue={this.state.year} style={{fontSize: 16, padding: 8}}
                          onChangeText={(text)=>this.setState({year: text})}/>
                      </CardItem>
                      <CardItem>
                        <Picker
                          selectedValue={this.state.semesterCode}
                          onValueChange={(itemValue, itemIndex) => {
                            this.setState({
                              semesterCode: itemValue,
                              semester: ['1학기', '2학기', '여름학기', '겨울학기'][itemIndex]
                            });
                          }}>
                          <Picker.Item label="1학기" value="Z0101" />
                          <Picker.Item label="2학기" value="Z0102" />
                          <Picker.Item label="여름학기" value="Z0103" />
                          <Picker.Item label="겨울학기" value="Z0104" />
                        </Picker>
                      </CardItem>
                      <CardItem>
                      <Picker
                        selectedValue={this.state.semesterCode}
                        onValueChange={(itemValue, itemIndex) => {
                          this.setState({
                            classroomCode: itemValue,
                            classroom: ['승연관', '일만관', '월당관', '미가엘관', '정보과학관', '새천년관'][itemIndex]
                          });
                        }}>
                        <Picker.Item label="승연관" value="1" />
                        <Picker.Item label="일만관" value="2" />
                        <Picker.Item label="월당관" value="3" />
                        <Picker.Item label="미가엘관" value="11" />
                        <Picker.Item label="정보과학관" value="6" />
                        <Picker.Item label="새천년관" value="7" />
                      </Picker>
                      </CardItem>
                      <CardItem>
                          <TextInput placeholder={'강의실 호수 (필수)'} style={{ fontSize: 16, padding: 8 }}
                              defaultValue={this.state.title}
                              onChangeText={(text) => this.setState({ title: text })} />
                      </CardItem>
                  </BottomModal>
              </View>
          );
      }
  }

  async loadSearchResults(){
    try{
      this.setState({refreshing: true});
      const results = await ForestApi.postToSam('/SSE/SSEAD/SSEAD01_GetList',
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
