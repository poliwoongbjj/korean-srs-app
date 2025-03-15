// pages/HelpPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./HelpPage.css";

const HelpPage = () => {
  return (
    <div className="help-page">
      <div className="help-header">
        <h1>Help & Tutorials</h1>
        <p>
          Learn how to use Wanki effectively to master your language learning
        </p>
      </div>

      <div className="help-content">
        <div className="help-sidebar">
          <div className="help-navigation">
            <h3>Topics</h3>
            <ul>
              <li>
                <a href="#getting-started">Getting Started</a>
              </li>
              <li>
                <a href="#cards-decks">Cards & Decks</a>
              </li>
              <li>
                <a href="#spaced-repetition">Spaced Repetition</a>
              </li>
              <li>
                <a href="#study-tips">Study Tips</a>
              </li>
              <li>
                <a href="#faq">FAQ</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="help-articles">
          <section id="getting-started" className="help-section">
            <h2>Getting Started</h2>

            <div className="help-article">
              <h3>Welcome to Wanki</h3>
              <p>
                Wanki is a powerful spaced repetition flashcard app designed to
                help you learn and remember new vocabulary effectively and
                efficiently.
              </p>
              <p>
                Whether you're learning Korean, Japanese, Spanish, or any other
                language, Wanki helps you master vocabulary through
                scientifically proven memory techniques.
              </p>
            </div>

            <div className="help-article">
              <h3>Creating Your Account</h3>
              <p>To get started with Wanki:</p>
              <ol>
                <li>Sign up for a free account using your email address</li>
                <li>Create your first deck or browse existing decks</li>
                <li>Add cards to your deck or import them</li>
                <li>Start studying with daily practice sessions</li>
              </ol>
              <p>
                Your progress will be saved automatically, allowing you to
                continue from where you left off on any device.
              </p>
            </div>
          </section>

          <section id="cards-decks" className="help-section">
            <h2>Cards & Decks</h2>

            <div className="help-article">
              <h3>Creating Cards</h3>
              <p>
                Cards are the building blocks of your study system. Each card
                contains:
              </p>
              <ul>
                <li>Foreign language text (front side)</li>
                <li>Translation in your native language (back side)</li>
                <li>
                  Optional: pronunciation, example sentences, images, audio
                </li>
              </ul>
              <p>
                To create a new card, click on "Cards" in the navigation menu,
                then click "Add New Card" and fill in the form.
              </p>
            </div>

            <div className="help-article">
              <h3>Organizing with Decks</h3>
              <p>
                Decks help you organize your cards by topic, difficulty, or
                language. For example, you might have decks for:
              </p>
              <ul>
                <li>Korean Basics</li>
                <li>Travel Phrases</li>
                <li>Business Vocabulary</li>
              </ul>
              <p>
                To create a new deck, click on "Decks" in the navigation menu,
                then click "Add New Deck" and provide a name and description.
              </p>
            </div>
          </section>

          <section id="spaced-repetition" className="help-section">
            <h2>Spaced Repetition System</h2>

            <div className="help-article">
              <h3>How Spaced Repetition Works</h3>
              <p>
                Wanki uses a spaced repetition algorithm based on the proven
                SuperMemo method. This system shows you cards at increasing
                intervals based on how well you remember them.
              </p>
              <p>
                When you review a card, you'll rate how well you remembered it:
              </p>
              <ul>
                <li>
                  <strong>Again</strong> - You didn't remember it at all (short
                  interval)
                </li>
                <li>
                  <strong>Hard</strong> - You remembered with difficulty
                  (slightly longer interval)
                </li>
                <li>
                  <strong>Good</strong> - You remembered correctly (standard
                  interval increase)
                </li>
                <li>
                  <strong>Easy</strong> - You remembered easily (extra-long
                  interval)
                </li>
              </ul>
              <p>
                The algorithm automatically adjusts future review intervals
                based on your ratings.
              </p>
            </div>

            <div className="help-article">
              <h3>The Learning Process</h3>
              <p>Cards progress through these stages:</p>
              <ol>
                <li>
                  <strong>New</strong> - Cards you haven't studied yet
                </li>
                <li>
                  <strong>Learning</strong> - Cards in the initial learning
                  process
                </li>
                <li>
                  <strong>Review</strong> - Cards in long-term memory with
                  increasing intervals
                </li>
              </ol>
              <p>
                This system ensures you focus your time on the cards you find
                most difficult, while spending less time on cards you know well.
              </p>
            </div>
          </section>

          <section id="study-tips" className="help-section">
            <h2>Study Tips</h2>

            <div className="help-article">
              <h3>Effective Study Habits</h3>
              <ul>
                <li>
                  <strong>Daily practice</strong> - Short, daily sessions are
                  much more effective than cramming
                </li>
                <li>
                  <strong>Be honest</strong> - Rate your cards based on actual
                  recall, not what you think you should know
                </li>
                <li>
                  <strong>Context matters</strong> - Add example sentences to
                  better understand usage
                </li>
                <li>
                  <strong>Start small</strong> - Begin with 5-10 new cards per
                  day and adjust as needed
                </li>
                <li>
                  <strong>Review regularly</strong> - Complete all daily reviews
                  to maintain your memory
                </li>
              </ul>
            </div>

            <div className="help-article">
              <h3>Common Mistakes to Avoid</h3>
              <ul>
                <li>
                  <strong>Adding too many cards</strong> - This leads to review
                  overload
                </li>
                <li>
                  <strong>Ignoring due reviews</strong> - This defeats the
                  purpose of spaced repetition
                </li>
                <li>
                  <strong>Creating overly complex cards</strong> - One concept
                  per card works best
                </li>
                <li>
                  <strong>Not using context</strong> - Isolated words are harder
                  to remember than phrases
                </li>
              </ul>
            </div>
          </section>

          <section id="faq" className="help-section">
            <h2>Frequently Asked Questions</h2>

            <div className="help-article">
              <h3>How many new cards should I add each day?</h3>
              <p>
                For most people, 5-10 new cards per day is sustainable. Remember
                that each new card you add today will generate reviews in the
                future, so start conservatively and adjust based on your
                available study time.
              </p>
            </div>

            <div className="help-article">
              <h3>What if I miss a day of reviews?</h3>
              <p>
                It's normal to miss days occasionally. Just continue where you
                left off. The system will adjust, though you might notice more
                "Again" ratings as some memories may have faded.
              </p>
            </div>

            <div className="help-article">
              <h3>Can I import cards from other systems?</h3>
              <p>
                We're working on an import feature to allow importing from CSV
                files and other popular flashcard systems. This feature will be
                available soon.
              </p>
            </div>

            <div className="help-article">
              <h3>How long will it take to learn a language?</h3>
              <p>
                Language learning is a marathon, not a sprint. With consistent
                daily practice using Wanki, you can build a substantial
                vocabulary within 3-6 months. Full fluency typically takes years
                of practice beyond just vocabulary acquisition.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
