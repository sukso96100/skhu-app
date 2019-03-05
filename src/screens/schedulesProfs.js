import React, { Component } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import {
  View, FlatList, Text, ActivityIndicator, StyleSheet,
  ScrollView, SafeAreaView, Button, Image, TouchableOpacity, RefreshControl, Modal, TextInput, Picker, SectionList
} from 'react-native';
import { CardView, CardItem, BottomModal } from '../components/components';
import { MaterialHeaderButtons } from '../components/headerButtons';
import BuildConfigs from '../config';
import Printer from '../tools/printer';
import DateTools from '../tools/datetools';
import ForestApi from '../tools/apis';
import moment from 'moment';

export default class SchedulesProfs extends Component{
  static navigationOptions = ({ navigation, navigationOptions }) => {
    const { params } = navigation.state;

    return {
      title: '교수님별 시간표 조회',
    };
  };

  constructor(props){
    super(props);
    const today = new Date();
    const semester = DateTools.getSemesterCode(today.getMonth()+1);
    this.state = {
      showSearchModal: true,
      year: today.getFullYear().toString(),
      semester: semester.name,
      semesterCode: semester.code,
      subject: '',
      major: '',
      name:'',
      result: [],
      refreshing: false,
      firstLoad: true
    };
    this.data = [];
  }
  componentDidMount(){
    this.loadList();
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
              {this.state.name} / {this.state.date}
            </Text>
            <MaterialIcons name="search" size={20} style={{ flex: 0 }} />
          </CardItem>

          <FlatList
            data={this.state.result}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this.search}
                tintColor={BuildConfigs.primaryColor}
                colors={[BuildConfigs.primaryColor]}
              />
            }
            ListFooterComponent={()=>(
              <CardItem style={{height: 50}}/>
            )}
            renderItem={({item})=>
              <CardItem onPress={()=>{
                // this.props.navigation.navigate('SyllabusDetails', {
                //   subjectCode: item.subjectCode,
                //   classCode: item.classCode,
                //   semesterCode: this.state.semesterCode,
                //   year: this.state.year
                // });
              }}>
                {/* <Text style={{fontWeight: 'bold'}}>{item.subject}({item.subjectCode}-{item.classCode})</Text>
                <Text>{item.college} {item.major} | {item.professor}({item.professorNo})</Text> */}
                <Text>{item.StaffName}</Text>
              </CardItem>
            }
          />

          {/* 검색창 */}
          <BottomModal
            title='교수님별 시간표 검색'
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
                  this.search();
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
              <TextInput placeholder={'교수님 성함(필수)'} style={{ fontSize: 16, padding: 8 }}
                defaultValue={this.state.name}
                onChangeText={(text) => this.setState({ name: text })} />
            </CardItem>
          </BottomModal>
        </View>
      );
    }
  }

  async loadList(){
    try{
      this.setState({refreshing: true});
      const results = await ForestApi.postToSam('/SSE/SSEAD/SSEAD05_GetStaff',
        JSON.stringify({
          'Haggi': this.state.semesterCode,
          'HaggiNm': this.state.semester,
          'Yy': this.state.year
        }));
      if(results.ok){
        const data = await results.json();
        this.data = data.DAT;
        this.setState({
          refreshing: false,
          firstLoad: false
        });
      }
    }catch(err){
      console.log(err);
    }
  }

  search(){
    let result = this.data.filter(item => item.StaffName.includes(this.state.name));
    this.setState({result: result});

  }
}
