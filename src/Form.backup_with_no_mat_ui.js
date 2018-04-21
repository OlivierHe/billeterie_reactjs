import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import './App.css';


class QtyBillets extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
     this.props.onValChange(event.target.name, event.target.value);
  }

  render (){
    return (      
      <label>
        Quantité de billets
        <input type="number" name="qtyBillets" value={this.props.value} onChange={this.handleChange}/>
      </label>
    );
  }
}


class CoordFields extends React.Component{
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  
  handleChange(event) {
    this.props.inpChange(event.target.name, event.target.value);
  }

  componentWillMount() {
    this.props.coordBackup();
  }

  componentWillUnmount() {
    this.props.coordRestore();
  }


  render() {
    return(
      <div>
      <fieldset>
      <legend>Coordonnées :</legend>
      <label>
        Nom
        <input type="text" name={this.props.nName} autoComplete="family-name" value={this.props.nom}  onChange={this.handleChange}/>
      </label>
      <label>
        Prénom
        <input type="text" name={this.props.pName}  autoComplete="given-name" value={this.props.prenom}  onChange={this.handleChange}/>
      </label>
      <label>
        Courriel
        <input type="text" name={this.props.cName}  autoComplete="email" value={this.props.courriel}  onChange={this.handleChange}/>
      </label>
      <label>
        Pays
        <select name={this.props.paName} autoComplete='country-name' value={this.props.pays} onChange={this.handleChange}>
            <option value> -- choisissez une option -- </option>
            <option value="france">France</option>
            <option value="angleterre">Angleterre</option>
            <option value="us">United states</option>
            <option value="belgique">Belgique</option>
          </select>
      </label>
      <label>
        Date de naissance
        <input type="date" name={this.props.dnName}  autoComplete="date" value={this.props.dateNaissance}  onChange={this.handleChange}/>
      </label>
      </fieldset>
      <fieldset>
      <legend>Réservation de billet :</legend>
      <label>
        Jour de la visite
        <input type="date" name={this.props.dvName}  autoComplete="date" value={this.props.dateVisite}  onChange={this.handleChange}/>
      </label>
      <label>
        Type de billet
        <select name={this.props.tbName} autoComplete='country-name' value={this.props.typeBillet} onChange={this.handleChange}>
            <option value> -- choisissez une option -- </option>
            <option value="journee">Journée</option>
            <option value="demi-journee">Demi-journée</option>
        </select>
      </label>
      </fieldset>
      </div>
    );
  }
}


class Form extends React.Component {
  constructor(props) {
    super(props);
    this.mofo = {};
    this.state = {
      qtyBillets: "0",
      isGoing: true,
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleRestore = this.handleRestore.bind(this);
    this.handleBackup = this.handleBackup.bind(this);
    this.handleQtyReset = this.handleQtyReset.bind(this);
    this.handleDelBillet = this.handleDelBillet.bind(this);
    this.handleQtyChange = this.handleQtyChange.bind(this);
  }

  clearTicket(billet){
    return {
      ['viewCoord' + billet] : false,
      ['prenom' + billet] : undefined,
      ['nom' + billet] : undefined,
      ['courriel' + billet] : undefined,
      ['pays' + billet] : undefined,
      ['date_naissance' + billet] : undefined,
      ['date_visite' + billet] : undefined,
      ['type_billet' + billet] : undefined,
    };
  }


  handleInputChange(iNam, iVal) {
    this.setState({
      [iNam]: iVal,
    });
  }
  

  handleBackup(){
    console.log("stock le prev state dans le backup");
    //this.setState({['viewCoord' + (this.state.qtyBillets -1).toString()] : true});
    //this.setState({viewCoord0 : true});
   /* this.setState((prevState, props) => {
      return this.mofo = prevState;
    }); */
  }

  handleRestore(){
    console.log('dans restore');
    //Object.assign(this.mofo, {qtyBillets : (this.mofo.qtyBillets -1).toString(), test: "roulious", nom0:undefined});

    const qtyBillets = this.state.qtyBillets;
    this.setState(this.clearTicket(qtyBillets));

    // permet de supprimer définitivement les attribut undefined sinon il sont toujours présents
    this.setState({});
    //console.log(this.mofo);
    //this.setState(this.mofo); 
    //console.log(this.state);
  }

  handleQtyReset(e) {
    e.preventDefault();
    this.setState({qtyBillets: "0"});
  }

  handleDelBillet(e) {
    e.preventDefault();
    const idBillet = e.currentTarget.getAttribute('idbillet');
    this.setState(this.clearTicket(idBillet));
    this.setState({});
  }


 handleQtyChange(iNam, iVal) {
    this.setState({
      [iNam]: iVal,
      ['viewCoord' + this.state.qtyBillets]: true,
    });
  } 

  render() {
    console.log(this.state);
    const forms = [];
    for(let i = 0; i < this.state.qtyBillets; i++) {
      //console.log(this.state["viewCoord" + i]);
      forms.push( this.state["viewCoord" + i] ? (
        <div key={i}>
        <CoordFields 
                     nName={"nom" + i}
                     nom={this.state.nom}
                     pName={"prenom" + i} 
                     prenom={this.state.prenom}
                     cName={"courriel" + i} 
                     courriel={this.state.courriel}
                     paName={"pays" + i} 
                     pays={this.state.pays}
                     dnName={"date_naissance" + i} 
                     dateNaissance={this.state.date_naissance}
                     dvName={"date_visite" + i} 
                     dateVisite={this.state.date_visite}  
                     tbName={"type_billet" + i} 
                     typeBillet={this.state.type_billet}  
                     inpChange={this.handleInputChange}
                     coordBackup={this.handleBackup}
                     coordRestore={this.handleRestore}/>            
        <button  idbillet={i} onClick={this.handleDelBillet}>Supprimer billet {i + 1}</button>
        </div>
                     ) : (
                      <p key={i}>billet {i + 1}  supprimé</p>
                     )
      );
    }

    return (
      <form>
    {/* dans la value on affiche la valeur de state = controlled component*/}
          <QtyBillets value={this.state.qtyBillets} onValChange={this.handleQtyChange}/>
          
          <div>{forms}</div>
          <button onClick={this.handleQtyReset}>Reset Qty</button>
      </form>
    );
  }
}

export default Form;
