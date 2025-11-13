import { StyleSheet } from 'react-native';

const style = StyleSheet.create({
  container: {
    // flexDirection: 'row', // coloca imagem e texto lado a lado
    // // alignItems: 'flex-start', // alinha pelo topo
    // // backgroundColor: '#f2f2f2',
    // padding: 19,
    // borderRadius: 8,
    // marginVertical: 10,

    flex: 1,
    justifyContent: 'center', // centraliza verticalmente
    alignItems: 'center', // centraliza horizontalmente
    // backgroundColor: '#f2f2f2',
  },
  image: {
    width: 150,
    height: 150,
    marginRight: 10,
    resizeMode: 'contain',
  },
  textWrapper: {
    flex: 1, // ocupa o restante do espaço
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default style;
