import React = require('react');
import ReactDOM = require('react-dom');
import ReactCSSTransitionGroup = require('react-addons-css-transition-group');

import MultipleChoices from './multiple-choices';
import Avatar from './avatar';
import * as Util from './util';
import * as Team from './team';

interface Props {
}

// Ugh, in practice, not all of these are truly optional, but we need
// to declare them as such in order to actually use setState() without
// ridiculous amounts of repetition.
//
// https://github.com/DefinitelyTyped/DefinitelyTyped/pull/4809
interface State {
  teamMembers?: Team.TeamMember[],
  currentMember?: Team.TeamMember,
  errorMessage?: string
}

class App extends React.Component<Props, State> {
  NUM_CHOICES = 4;

  state = {
    teamMembers: [],
    currentMember: null,
    errorMessage: null
  };

  setNewQuestion(members: Team.TeamMember[]) {
    this.setState({ currentMember: Util.randomChoice(members) });
  }

  handleCorrectAnswerChosen = () => {
    let members = Util.without(this.state.teamMembers,
                               this.state.currentMember);
    this.setNewQuestion(members);
  }

  componentDidMount() {
    // TODO: Deal with case where component is unmounted before
    // the promise is fulfilled.

    Team.get().then((members) => {
      this.setState({ teamMembers: members });
      this.setNewQuestion(members);
    }).catch(e => {
      console.log(e);
      this.setState({
        currentMember: null,
        errorMessage: "Alas, an error has occurred."
      });
    });
  }

  render() {
    let content = null;

    if (this.state.currentMember) {
      content = (
        <div className="multiple-choice-question-holder">
          <ReactCSSTransitionGroup
           transitionName="fade"
           transitionEnterTimeout={300}
           transitionLeaveTimeout={150}>
            <MultipleChoices
             choicePool={this.state.teamMembers}
             answer={this.state.currentMember}
             numChoices={this.NUM_CHOICES}
             onCorrectAnswerChosen={this.handleCorrectAnswerChosen}
             key={this.state.currentMember.github}
            />
          </ReactCSSTransitionGroup>
        </div>
      );
    } else if (this.state.errorMessage) {
      content = <span>{this.state.errorMessage}</span>;
    } else {
      // This is a hack for a loading throbber.
      content = <Avatar url="" />;
    }

    // Note that the initial state of this component has been
    // copied into index.html, so any changes should be reflected there.

    return (
      <div>
        <div className="usa-grid">
          <div className="usa-width-one-whole">
            <h1>Humans of 18F</h1>
          </div>
        </div>
        <div className="usa-grid">
          <div className="usa-width-one-third">&nbsp;</div>
          <div className="usa-width-one-third">
            {content}
          </div>
          <div className="usa-width-one-third">&nbsp;</div>
        </div>
      </div>
    );
  }
}

function init() {
  ReactDOM.render(
    <App/>,
    document.getElementById('app')
  );
}

window.addEventListener('load', init, false);
