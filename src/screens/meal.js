import React, { Component } from 'react';
import { CardItem, CardView } from '../components/components';
import { ScrollView, SafeAreaView, View, Text, ActivityIndicator, FlatList } from 'react-native';
import FetchHelper from '../tools/fetchHelper';
import BuildConfigs from '../config';



export default class Meal extends Component {
  static navigationOptions = ({ navigation, navigationOptions }) => {
    const { params } = navigation.state;

    return {
      title: '학생 식단',
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      url: '',
      meals: [],
      isLoading: true
    };
    FetchHelper.fetchMealsUrl().then(url => this.setState({ url }));
  }

  componentDidMount() {
    FetchHelper.fetchMealsData(this.state.url).then(meals => {
      this.setState({
        meals,
        isLoading: false
      });
    });
  }

  render() {
    const { meals, isLoading } = this.state;

    if (isLoading) {
      return (
        <View style={{ justifyContent: 'center', padding: 32 }}>
          <ActivityIndicator size='large' color={BuildConfigs.primaryColor} />
        </View>
      );
    }
    else {
      return (
        // <View>
        //   <FlatList
        //     data={meals}
        //     renderItem={({ item }) => (
        //       <SafeAreaView>
        //         <ScrollView>
        //           <View style={{ marginRight: 50, marginLeft: 14, }}>
        //             <CardView style={{ flex: 0, flexDirection: 'row' }} >
        //               <View>
        //                 <View>
        //                   <Text style={{ fontSize: 20 }}>{item.day} 식단</Text>
        //                 </View>
        //                 <View style={{ flexDirection: 'row' }}>
        //                   <View>
        //                     <Text style={{ fontWeight: 'bold', fontSize: 16 }}>학식</Text>
        //                     <Text>{item.lunch.a.diet}</Text>
        //                     <Text> </Text>
        //                     <Text style={{ fontWeight: 'bold', fontSize: 16 }}>일품</Text>
        //                     <Text>{item.lunch.b.diet}                      </Text>
        //                     {/* <View style={{ flexDirection: 'row' }}>
        //                     <Text style={{ color: 'grey' }}>주간 식단 보기</Text>
        //                     <MaterialIcons name="chevron-right" size={16} />
        //                   </View> */}
        //                   </View>
        //                   <View>
        //                     <Text style={{ fontWeight: 'bold', fontSize: 16 }}>석식</Text>
        //                     <Text>{item.dinner.a.diet}</Text>
        //                   </View>
        //                 </View>
        //               </View>
        //             </CardView>
        //           </View>
        //         </ScrollView>
        //       </SafeAreaView>
        //     )}
        //   />
        // </View>

        <View>
          <FlatList
            data={meals}
            renderItem={({ item }) => (
              <SafeAreaView>
                <ScrollView>
                  <View style={{ marginRight: 50, marginLeft: 14, }}>
                    <CardView style={{ flex: 0, flexDirection: 'row' }} >
                  
                      <View>
                        <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 10 }}>[{item.day} 식단]</Text>
                        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>학식</Text>
                        <Text style={{ marginBottom :10 }}>{item.lunch.a.diet}</Text>
                        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>일품</Text>
                        <Text style={{ marginBottom :10 }}>{item.lunch.b.diet}</Text>
                        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>석식</Text>
                        <Text style={{ marginBottom :5 }}>{item.dinner.a.diet}</Text>
                      </View>
                    </CardView>
                  </View>
                </ScrollView>
              </SafeAreaView>)}
          />
        </View>

        // <FlatList
        //   data={meals}
        //   renderItem={({ item }) => (
        //     <CardItem>
        //       <Text>[{item.day}요일 식단입니다]</Text>
        //       <Text style={{ fontWeight: 'bold' }}>점심</Text>
        //       <Text>{item.lunch.a.diet}</Text>
        //       <Text style={{ fontWeight: 'bold' }}>일품</Text>
        //       <Text>{item.lunch.b.diet}</Text>
        //       <Text style={{ fontWeight: 'bold' }}>저녁</Text>
        //       <Text>{item.dinner.a.diet}</Text>
        //     </CardItem>
        //   )}
        // />
      );
    }
  }
}
